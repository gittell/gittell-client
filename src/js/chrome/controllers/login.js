/* global chrome */
var querystring = require('querystring');
var config = require('../../config');
var AccessToken = require('../../models/access-token');
var User = require('../../models/user');

module.exports = ['$scope', function($scope) {
  $scope.accessToken = AccessToken.get();
  $scope.isLoggedIn = !!$scope.accessToken;
  $scope.login = function(interactive) {
    console.log("start login");
    $scope.isLoading = true;
    var redirectUri = 'https://' + chrome.runtime.id + '.chromiumapp.org/provider_cb';
    var state = Math.random().toString(36).substring(2);
    var authzUrl = config.client.authzUrl + "?" + querystring.stringify({
      client_id: "chromeExtension",
      response_type: "token",
      redirect_uri: redirectUri,
      reauthorize: true,
      state: state
    });
    var options = { interactive: interactive, url: authzUrl };
    chrome.identity.launchWebAuthFlow(options, function(callbackUrl) {
      console.log("login complete", callbackUrl);
      $scope.isLoading = false;
      if (chrome.runtime.lastError) {
        $scope.error = chrome.runtime.lastError;
        return;
      }
      var hashQuery = callbackUrl.split('#')[1];
      var hashParams = querystring.parse(hashQuery);
      if (state !== hashParams.state) {
        $scope.error = new Error("state parameter doesn't match");
        console.log($scope.error);
        return;
      }
      $scope.accessToken = hashParams.access_token;
      $scope.isLoggedIn = true;
      AccessToken.set($scope.accessToken);
      $scope.getLoginUser();
    });
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
    chrome.identity.launchWebAuthFlow({ url: config.authzServerUrl + "/auth/logout" }, function() {
      AccessToken.remove();
      $scope.accessToken = null;
      $scope.isLoggedIn = false;
      $scope.loginUser = null;
      $scope.$apply();
    });
  };
  $scope.getLoginUser();
}];
