
module.exports = (grunt) ->
  pkg = grunt.file.readJSON("package.json")
  if pkg.devDependencies
    Object.keys(pkg.devDependencies).filter (pkgname) ->
      grunt.loadNpmTasks pkgname  if pkgname.indexOf("grunt-") is 0

  grunt.initConfig
    pkg: pkg

    target: "develop"

    buildDir: "build"

    tmpBuildDir: "<%= buildDir %>/__tmp__"

    webBuildDir: "<%= buildDir %>/<%= target %>"

    chromeBuildDir: "<%= buildDir %>/chrome/<%= target %>"

    watch:
      lib:
        files: ["src/**"]
        tasks: ["build"]

      test:
        files: ["test/*.test.js"]
        tasks: ["test"]

    less:
      webapp:
        files:
          "<%= tmpBuildDir %>/css/main.css": ["src/less/main.less"]

      chrome:
        files:
          "<%= tmpBuildDir %>/css/chrome/popup.css": ["src/less/chrome/popup.less"]
          "<%= tmpBuildDir %>/css/chrome/options.css": ["src/less/chrome/options.less"]

    copy:
      js:
        files: [
          expand: true
          cwd: "src/js"
          src: ["**/*.js"]
          dest: "<%= tmpBuildDir %>/js"
        ]

      statics:
        expand: true
        cwd: "src/"
        src: [
          "**"
          "!**/*.js"
          "!**/*.less"
        ]
        dest: "<%= tmpBuildDir %>"

      assets:
        expand: true
        src: ["assets/vendor/**"]
        dest: "<%= tmpBuildDir %>"

      webapp:
        expand: true
        cwd: "<%= tmpBuildDir %>"
        src: [
          "assets/**"
          "images/**"
          "css/**"
          "templates/**"
        ]
        dest: "<%= webBuildDir %>"

      chrome:
        files: [
          expand: true
          cwd: "<%= tmpBuildDir %>"
          src: [
            "assets/**"
            "images/**"
            "css/**"
            "templates/**"
          ]
          dest: "<%= chromeBuildDir %>"
        ,
          expand: true
          cwd: "<%= tmpBuildDir %>/chrome"
          src: [
            "manifest.json"
            "*.html"
            "css/**"
            "images/**"
          ]
          dest: "<%= chromeBuildDir %>"
        ]

    browserify:
      webapp:
        files:
          "<%= webBuildDir %>/js/main.js": ["<%= tmpBuildDir %>/js/main.js"]
          "<%= webBuildDir %>/js/callback.js": ["<%= tmpBuildDir %>/js/callback.js"]

      chrome:
        files:
          "<%= chromeBuildDir %>/js/chrome/background.js": ["<%= tmpBuildDir %>/js/chrome/background.js"]
          "<%= chromeBuildDir %>/js/chrome/popup.js": ["<%= tmpBuildDir %>/js/chrome/popup.js"]
          "<%= chromeBuildDir %>/js/chrome/options.js": ["<%= tmpBuildDir %>/js/chrome/options.js"]
          "<%= chromeBuildDir %>/js/chrome/observe.js": ["<%= tmpBuildDir %>/js/chrome/observe.js"]

      test:
        files: [
          expand: true
          cwd: "test/"
          src: [
            "**/*.test.js"
            "!browser/**"
          ]
          dest: "test/browser/"
        ]

      options:
        transform: [[
          "envify"
          {
            API_SERVER_URL:
              "<%= target === 'local' ? 'http://localhost:5000' : 'https://gittell' + (target ==='production' ? '' : '-' + target ) + '.herokuapp.com' %>"
            AUTHZ_SERVER_URL:
              "<%= target === 'local' ? 'http://localhost:5000' : 'https://gittell' + (target ==='production' ? '' : '-' + target ) + '.herokuapp.com' %>"
          }
        ]]

    espower:
      test:
        files: [
          expand: true
          cwd: "test/"
          src: ["**/*.js"]
          dest: "test-powered/"
        ]

    clean:
      all:
        src: [ "build/*" ]

      webapp:
        src: [ "build/<%= target %>" ]

      chrome:
        src: [ "build/chrome/<%= target %>" ]

      tmp:
        src: ["<%= tmpBuildDir %>/**"]

      test:
        src: [
          "test/browser/**"
          "test-powered/**"
        ]

  grunt.registerTask "target:local", -> grunt.config "target", "local"
  grunt.registerTask "target:develop", -> grunt.config "target", "develop"
  grunt.registerTask "target:staging", -> grunt.config "target", "staging"
  grunt.registerTask "target:production", -> grunt.config "target", "production"

  grunt.registerTask "test", [ "browserify:test", "espower" ]
  grunt.registerTask "buildapp", [ "cleanbuild", "less", "copy", "browserify" ]
  grunt.registerTask "cleanbuild", [ "clean:chrome", "clean:webapp" ]
  grunt.registerTask "build:local", [ "target:local", "buildapp" ]
  grunt.registerTask "build:develop", [ "target:develop", "buildapp" ]
  grunt.registerTask "build:staging", [ "target:staging", "buildapp" ]
  grunt.registerTask "build:production", [ "target:production", "buildapp" ]
  grunt.registerTask "build", ["build:local"]
  grunt.registerTask "default", ["build"]
