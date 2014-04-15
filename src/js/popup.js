/*global angular*/

var ActivityLog = require('./model/activity-log');

var app = angular.module('popup', [ 'ui.bootstrap' ])
  .controller('ActivityLogController', [ '$scope', function($scope) {
    $scope.addTargetDate = function(diff) {
      $scope.targetDate += diff * 24 * 60 * 60 * 1000;
      $scope.fetchGroups();
    };
    $scope.fetchGroups = function() {
      ActivityLog.listLogGroups({ date: $scope.targetDate }, 'totalDuration', function(err, groups) {
        $scope.loading = false;
        $scope.groups = groups;
      });
      $scope.loading = true;
    };
    $scope.targetDate = $scope.now = Date.now();
    $scope.fetchGroups();
  }]);

var filters = {
  formatDuration: function(ms) {
    try {
      var s = Math.floor(ms/1000);
      var m = Math.floor(s/60);
      var h = Math.floor(m/60);
      var d = Math.floor(h/24);
      return m < 1 ? s + " sec" :
             h < 1 ? m + " min" :
             d < 1 ? h + " hour" + (h>1 ? "s" : "") + (
                       h < 6 ? (m < 15 ? "" :
                                m < 30 ? "15 min" :
                                m < 45 ? "30 min" :
                                         "45 min") :
                       ""
                     ) :
             d + " day" + (d>1 ? "s" : "");
    } catch(e) {
      return "!ERR!";
    }
  },

  secondIndicator: function(ms) {
    var s = ms/1000;
    return s > 60 ? 100 : Math.floor(100*s/60);
  },

  minuteIndicator: function(ms) {
    var m = ms/(60 * 1000);
    return m > 60 ? 100 : Math.floor(100*m/60);
  },

  hourIndicator: function(ms) {
    var h = ms/(60 * 60 * 1000);
    return h > 24 ? 100 : Math.floor(100*h/24);
  }

};

Object.keys(filters).forEach(function(fname) {
  app.filter(fname, function() {
    return filters[fname];
  });
});
