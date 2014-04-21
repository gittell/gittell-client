module.exports = [ "$scope", "ActivityLog", function($scope, ActivityLog) {
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
}];