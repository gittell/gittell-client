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
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: [ '**' ],
          dest: 'build/'
        }, {
          expand: true,
          cwd: 'assets/',
          src: [
            'vendor/angular*/**',
            'vendor/font-awesome/**',
            'vendor/bootstrap/dist/**'
          ],
          dest: 'build/assets'
        }]
      }
    },

    browserify: {
      lib: {
        files: {
          'build/js/background-main.js': [ 'build/js/background.js' ],
          'build/js/popup-main.js': [ 'build/js/popup.js' ],
          'build/js/options-main.js': [ 'build/js/options.js' ],
          'build/js/observe-main.js': [ 'build/js/observe.js' ]
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
              API_SERVER_URL: 'https://meetell-server.herokuapp.com',
              AUTHZ_SERVER_URL: 'https://meetell-server.herokuapp.com'
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
          "build/css/popup.css": [ "src/less/popup.less" ]
        }
      }
    },

    clean: {
      lib: {
        src: [ "build/*" ]
      },
      test: {
        src: [ "test/browser/**", "test-powered/**" ]
      }
    }

  });

  grunt.registerTask('test', [ 'browserify:test', 'espower' ]);
  grunt.registerTask('build', [ 'copy', 'less', 'browserify:lib' ]);
  grunt.registerTask('default', [ 'build' ]);

};
