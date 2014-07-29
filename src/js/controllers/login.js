var querystring = require('querystring');
var config = require('../config');
var AccessToken = require('../models/access-token');
var User = require('../models/user');

module.exports = ['$scope', function($scope) {
  $scope.accessToken = AccessToken.get();
  $scope.isLoggedIn = !!$scope.accessToken;
  $scope.login = function(interactive) {
    console.log("start login");
    $scope.isLoading = true;
    var redirectUri = location.href.split('/').slice(0, 3).join('/') + '/callback.html';
    var state = Math.random().toString(36).substring(2);
    var authzUrl = config.client.authzUrl + "?" + querystring.stringify({
      client_id: "web",
      response_type: "token",
      redirect_uri: redirectUri,
      reauthorize: true,
      state: state
    });
    location.href = authzUrl;
  };
  $scope.getLoginUser = function() {
    console.log("getLoginUser");
    User.getProfile(function(err, user) {
      console.log(err, user);
      $scope.loginUser = user;
      $scope.$apply();
    });
  };
  $scope.logout = function() {
    AccessToken.remove();
    $scope.accessToken = null;
    $scope.isLoggedIn = false;
    $scope.loginUser = null;
    $scope.$apply();
  };
  $scope.getLoginUser();
}];
