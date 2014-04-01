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
        files: [ "src/**/*.js" ],
        tasks: [ "build" ]
      }
    },

    browserify: {
      lib: {
        files: {
          'build/js/background.js': [ 'src/js/background.js' ],
          'build/js/popup.js': [ 'src/js/popup.js' ]
        }
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: [ '*.json', '*.html', 'images/**' ],
          dest: 'build/'
        }]
      }
    },

    clean: {
      lib: {
        src: [ "build/*" ]
      }
    }

  });

  grunt.registerTask('build', [ 'browserify', 'copy' ]);
  grunt.registerTask('default', ['build']);

};
