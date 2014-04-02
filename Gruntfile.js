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

    browserify: {
      lib: {
        files: {
          'build/js/background.js': [ 'src/js/background.js' ],
          'build/js/popup.js': [ 'src/js/popup.js' ],
          'build/js/activity-observe.js': [ 'src/js/activity-observe.js' ]
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

    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: [ '*.json', '*.html', 'images/**', 'assets/**' ],
          dest: 'build/'
        }, {
          expand: true,
          cwd: 'assets/',
          src: [ 'vendor/*/dist/**' ],
          dest: 'build/assets'
        }]
      }
    },

    clean: {
      lib: {
        src: [ "build/*" ]
      }
    }

  });

  grunt.registerTask('build', [ 'less', 'browserify', 'copy' ]);
  grunt.registerTask('default', ['build']);

};
