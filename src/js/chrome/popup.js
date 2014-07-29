/* global angular */

module.exports = angular.module('app.chrome.popup', [ 'ui.bootstrap' ])
  .config(require('../filters'))
  .controller('ChromeLoginController', require('./controllers/login'))
  .controller('ActivityController', require('../controllers/activity'));

