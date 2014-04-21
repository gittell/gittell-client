/*global angular, chrome */
module.exports = angular.module('app.options', [
  'ui.bootstrap',
  require('./services').name
]).controller('LoginController', require('./controllers/login'));
