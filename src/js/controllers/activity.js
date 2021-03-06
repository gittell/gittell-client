var Activity = require('../models/activity');
var _ = require('underscore');

module.exports = [ "$scope", function($scope) {
  $scope.addTargetDate = function(diff) {
    var dt = $scope.targetDateInMsec + diff * 24 * 60 * 60 * 1000;
    $scope.targetDate = new Date(dt);
  };
  $scope.resetTargetDate = function() {
    $scope.targetDate = new Date();
  };
  $scope.$watch("targetDate", function() {
    if (!$scope.targetDate) { return; }
    $scope.targetDateInMsec = $scope.targetDate.getTime();
    $scope.fetchActivities();
  });
  $scope.fetchActivities = function() {
    Activity.listSummary({ date: $scope.targetDate }, 'totalDuration', function(err, activities) {
      $scope.loading = false;
      $scope.activities = groupByProject(activities);
      console.log($scope.activities);
      $scope.$apply();
    });
    $scope.loading = true;
  };
  var today = new Date();
  $scope.now = today.getTime();
  $scope.targetDate = $scope.today = today;
  $scope.fetchActivities();
}];

function groupByProject(activities) {
  var projects = {};
  var actvs = [];
  activities.forEach(function(activity) {
    if (activity.projectUrl) {
      var projectUrl = activity.projectUrl;
      var project = projects[projectUrl];
      if (!project) {
        project = projects[projectUrl] = {
          url: projectUrl,
          title: activity.projectTitle,
          site: activity.site,
          totalDuration: 0,
          children: []
        };
      }
      project.children.push(activity);
      project.totalDuration += activity.totalDuration;
    } else {
      activity.children = [];
      actvs.push(activity);
    }
  });
  var sortByTotalDuration = function(a1, a2) {
    return a1.totalDuration < a2.totalDuration ? 1 :
           a1.totalDuration > a2.totalDuration ? -1 :
           0;
  };
  projects = _.values(projects).map(function(p) {
    p.children = p.children.sort(sortByTotalDuration);
    return p;
  });
  return actvs.concat(projects).sort(sortByTotalDuration);
}