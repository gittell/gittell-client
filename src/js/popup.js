/* global angular */

module.exports = angular.module('app.popup', [ 'ui.bootstrap' ])
  .config(require('./filters'))
  .controller('ActivityController', require('./controllers/activity'));

