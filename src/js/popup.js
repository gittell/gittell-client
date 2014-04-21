/*global angular*/

module.exports = angular.module('app.popup', [
  'ui.bootstrap',
  require('./services').name
])
  .config(require('./filters'))
  .controller('ActivityLogController', require('./controllers/activity-log'));

