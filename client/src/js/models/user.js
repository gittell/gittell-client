var _ = require('underscore');
var Q = require('q');
var xhr = require('xhr');
var config = require('../config');
var AccessToken = require('./access-token');

var User = module.exports = function() {};

User.getProfile = function(callback) {
  xhr({
    method: 'GET',
    url: config.apiBaseUrl + "/user/me",
    headers: AccessToken.getAuthorizationHeader(),
    json: true
  }, function(err, res, body) {
    if (err || res.statusCode >= 400) {
      callback(err || new Error(body.message));
    } else {
      callback(null, body);
    }
  });
};
