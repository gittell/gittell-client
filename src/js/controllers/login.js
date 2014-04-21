/* global chrome */
var querystring = require('querystring');

module.exports = ['$scope', 'AuthToken', 'AppConfig', function($scope, AuthToken, AppConfig) {
  $scope.accessToken = AuthToken.get();
  $scope.isLoggedIn = !!$scope.accessToken;
  $scope.login = function(interactive) {
    console.log("start login");
    $scope.isLoading = true;
    var redirectUri = 'https://' + chrome.runtime.id + '.chromiumapp.org/provider_cb';
    var state = Math.random().toString(36).substring(2);
    var authzUrl = AppConfig.client.authzUrl + "?" + querystring.stringify({
      client_id: "chromeExtension",
      response_type: "token",
      redirect_uri: redirectUri,
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
      AuthToken.set($scope.accessToken);
      $scope.$apply();
    });
  };
  $scope.logout = function() {
    AuthToken.set(null);
    $scope.accessToken = null;
    $scope.isLoggedIn = false;
  };
}];
