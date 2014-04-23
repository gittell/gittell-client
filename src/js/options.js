/*global angular */

module.exports = angular.module('app.options', ['ui.bootstrap'])
  .controller('LoginController', require('./controllers/login'));
