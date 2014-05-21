var Q = require('q');
var xhr = require('xhr');
var config = require('../config');

var atKeyName = 'gittell_access_token';
var atDeferred = Q.defer();

module.exports = {
  get: function() {
    return localStorage.getItem(atKeyName);
  },
  set: function(accessToken) {
    localStorage.setItem(atKeyName, accessToken);
    atDeferred.resolve(accessToken);
  },
  remove: function() {
    var accessToken = this.get();
    localStorage.removeItem(atKeyName);
    atDeferred = Q.defer();
    if (accessToken) {
      var noop = function() {};
      xhr({
        method: 'POST',
        url: config.authzServerUrl + "/oauth2/revoke",
        body: "token="+ accessToken
      }, noop);
    }
  },
  getAuthorizationHeader: function() {
    return {
      Authorization: "Bearer "+this.get()
    };
  },
  waitAuthorize: function() {
    var accessToken = this.get();
    if (accessToken) { atDeferred.resolve(accessToken); }
    return atDeferred.promise;
  }
};