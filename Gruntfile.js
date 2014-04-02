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
      scripts: {
        files: [ "src/**" ],
        tasks: [ "build" ]
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
          src: [ 'vendor/*/dist/**' ],
          dest: 'build/assets'
        }]
      }
    },

    browserify: {
      lib: {
        files: {
          'build/js/background-main.js': [ 'build/js/background.js' ],
          'build/js/popup-main.js': [ 'build/js/popup.js' ],
          'build/js/observe-main.js': [ 'build/js/observe.js' ]
        }
      }
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
      }
    }

  });

  grunt.registerTask('build', [ 'copy', 'less', 'browserify' ]);
  grunt.registerTask('default', ['build']);

};
