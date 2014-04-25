/* global angular */

module.exports = angular.module('app.popup', [ 'ui.bootstrap' ])
  .config(require('./filters'))
  .controller('LoginController', require('./controllers/login'))
  .controller('ActivityController', require('./controllers/activity'));

