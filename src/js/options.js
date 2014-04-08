/*global angular*/

var ActivityLog = require('./activity-log');

var app = angular.module('options', ['ui.bootstrap'])
  .controller('SiteController', ['$scope', function($scope) {
    $scope.addTargetDate = function(diff) {
      $scope.fetchSites();
    };
    $scope.fetchGroups = function() {
      $scope.groups = ActivityLog.listLogGroups({ date: $scope.targetDate }, 'totalDuration');
    };
    $scope.targetDate = $scope.now = Date.now();
    $scope.fetchGroups();
  }]);
