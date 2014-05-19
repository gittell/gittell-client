/*global process */
var fs = require('fs');

module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');
  if (pkg.devDependencies) {
    Object.keys(pkg.devDependencies).filter(function(pkgname) {
      if (pkgname.indexOf('grunt-') === 0) {
        grunt.loadNpmTasks(pkgname);
      }
    });
  }

  grunt.initConfig({

    pkg: pkg,

    target: 'develop',

    buildDir: 'build',

    tmpBuildDir: '<%= buildDir %>/__tmp__',

    webBuildDir: '<%= buildDir %>/<%= target %>',

    chromeBuildDir : '<%= buildDir %>/chrome-extension/<%= target %>',

    watch: {
      lib: {
        files: [ "src/**" ],
        tasks: [ "build" ]
      },
      test: {
        files: [ "test/*.test.js" ],
        tasks: [ "test" ]
      }
    },

    copy: {
      js: {
        files: [{
          expand: true,
          cwd: 'src/js',
          src: [ '**/*.js' ],
          dest: '<%= tmpBuildDir %>/js'
        }]
      },
      statics: {
        expand: true,
        cwd: 'src/',
        src: [ '**', '!**/*.js', '!**/*.less' ],
        dest: '<%= tmpBuildDir %>'
      },
      assets: {
        expand: true,
        src: [ 'assets/vendor/**'],
        dest: '<%= tmpBuildDir %>'
      },
      webapp: {
        expand: true,
        cwd: '<%= tmpBuildDir %>',
        src: [ '**', '!js/**' ],
        dest: '<%= webBuildDir %>'
      },
      chromeExtension: {
        expand: true,
        cwd: '<%= tmpBuildDir %>',
        src: [ '**', '!js/**' ],
        dest: '<%= chromeBuildDir %>'
      }
    },

    browserify: {
      webapp: {
        files: {
          '<%= webBuildDir %>/js/main.js': [ '<%= tmpBuildDir %>/js/popup.js' ]
        }
      },
      chromeExtension: {
        files: {
          '<%= chromeBuildDir %>/js/background-main.js': [ '<%= tmpBuildDir %>/js/background.js' ],
          '<%= chromeBuildDir %>/js/popup-main.js': [ '<%= tmpBuildDir %>/js/popup.js' ],
          '<%= chromeBuildDir %>/js/options-main.js': [ '<%= tmpBuildDir %>/js/options.js' ],
          '<%= chromeBuildDir %>/js/observe-main.js': [ '<%= tmpBuildDir %>/js/observe.js' ]
        }
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/',
          src: [
            '**/*.test.js', '!browser/**'
          ],
          dest: 'test/browser/'
        }]
      },
      options: {
        transform: [
          [
            'envify',
            {
              API_SERVER_URL: 'https://gittell<%= target ==="production" ? "" : "-" + target %>.herokuapp.com',
              AUTHZ_SERVER_URL: 'https://gittell<%= target ==="production" ? "" : "-" + target %>.herokuapp.com'
            }
          ]
        ]
      }
    },

    espower: {
      test: {
        files: [{
          expand: true,
          cwd: 'test/',
          src: [ '**/*.js' ],
          dest: 'test-powered/'
        }]
      },
    },
  
    less: {
      dist: {
        files: {
          "<%= tmpBuildDir %>/css/popup.css": [ "src/less/popup.less" ]
        }
      }
    },

    clean: {
      lib: {
        src: [ "build/*" ]
      },
      tmp: {
        src: [ "<%= tmpBuildDir %>/**" ]
      },
      test: {
        src: [ "test/browser/**", "test-powered/**" ]
      }
    }

  });

  grunt.registerTask('target:develop', function() {
    grunt.config('target', 'develop');
  });
  grunt.registerTask('target:staging', function() {
    grunt.config('target', 'staging');
  });
  grunt.registerTask('target:production', function() {
    grunt.config('target', 'production');
  });
  grunt.registerTask('test', [ 'browserify:test', 'espower' ]);
  grunt.registerTask('buildapp', [ 'less', 'copy', 'browserify' ]);
  grunt.registerTask('build:develop', [ 'target:develop', 'buildapp' ]); //, 'clean:tmp' ]);
  grunt.registerTask('build:staging', [ 'target:staging', 'buildapp' ]); //, 'clean:tmp' ]);
  grunt.registerTask('build:production', [ 'target:production', 'buildapp' ]); //, 'clean:tmp' ]);
  grunt.registerTask('build', [ 'build:develop' ]);
  grunt.registerTask('default', [ 'build' ]);

};
