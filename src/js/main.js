/* global angular */

module.exports = angular.module('app.main', [ 'ui.bootstrap' ])
  .config(require('./filters'))
  .controller('LoginController', require('./controllers/login'))
  .controller('ActivityController', require('./controllers/activity'));
