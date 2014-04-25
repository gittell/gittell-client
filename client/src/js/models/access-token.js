var xhr = require('xhr');
var config = require('../config');

var atKeyName = 'meetell_access_token';
module.exports = {
  get: function() {
    return localStorage.getItem(atKeyName);
  },
  set: function(accessToken) {
    localStorage.setItem(atKeyName, accessToken);
  },
  remove: function() {
    var accessToken = this.get();
    localStorage.removeItem(atKeyName);
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
  }
};