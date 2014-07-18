
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

    chromeBuildDir: "<%= buildDir %>/chrome-extension/<%= target %>"

    watch:
      lib:
        files: ["src/**"]
        tasks: ["build"]

      test:
        files: ["test/*.test.js"]
        tasks: ["test"]

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

      chromeExtension:
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
          cwd: "<%= tmpBuildDir %>/chrome-extension"
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
          "<%= webBuildDir %>/js/main.js": ["<%= tmpBuildDir %>/js/popup.js"]

      chromeExtension:
        files:
          "<%= chromeBuildDir %>/js/background-main.js": ["<%= tmpBuildDir %>/chrome-extension/js/background.js"]
          "<%= chromeBuildDir %>/js/popup-main.js": ["<%= tmpBuildDir %>/chrome-extension/js/popup.js"]
          "<%= chromeBuildDir %>/js/options-main.js": ["<%= tmpBuildDir %>/chrome-extension/js/options.js"]
          "<%= chromeBuildDir %>/js/observe-main.js": ["<%= tmpBuildDir %>/chrome-estension/js/observe.js"]

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
            API_SERVER_URL: "https://gittell<%= target ==='production' ? '' : '' + target %>.herokuapp.com"
            AUTHZ_SERVER_URL: "https://gittell<%= target ==='production' ? '' : '' + target %>.herokuapp.com"
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

    less:
      dist:
        files:
          "<%= tmpBuildDir %>/css/popup.css": ["src/less/popup.less"]

    clean:
      lib:
        src: ["build/*"]

      tmp:
        src: ["<%= tmpBuildDir %>/**"]

      test:
        src: [
          "test/browser/**"
          "test-powered/**"
        ]

  grunt.registerTask "target:develop", ->
    grunt.config "target", "develop"

  grunt.registerTask "target:staging", ->
    grunt.config "target", "staging"

  grunt.registerTask "target:production", ->
    grunt.config "target", "production"

  grunt.registerTask "test", [
    "browserify:test"
    "espower"
  ]
  grunt.registerTask "buildapp", [
    "less"
    "copy"
    "browserify"
  ]
  grunt.registerTask "build:develop", [ #, 'clean:tmp' ]);
    "target:develop"
    "buildapp"
  ]
  grunt.registerTask "build:staging", [ #, 'clean:tmp' ]);
    "target:staging"
    "buildapp"
  ]
  grunt.registerTask "build:production", [ #, 'clean:tmp' ]);
    "target:production"
    "buildapp"
  ]
  grunt.registerTask "build", ["build:develop"]
  grunt.registerTask "default", ["build"]
  return
