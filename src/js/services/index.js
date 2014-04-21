/* global angular */
var ActivityLog = require('../models/activity-log');
var Site = require('../models/site');

module.exports = angular.module("MeetellService", [])
  .factory("AuthToken", function() {
    return {
      get: function() {
        return localStorage.getItem('meetell_access_token');
      },
      set: function(accessToken) {
        return localStorage.setItem('meetell_access_token', accessToken);
      }
    };
  })
  .factory("ActivityLog", function() {
    return ActivityLog;
  })
  .factory("Site", function() {
    return Site;
  })
  .factory("AppConfig", function() {
    return {
      client: {
        authzUrl: "http://localhost:5000/oauth2/authorize",
        clientId: "chromeExtension"
      }
    };
  });
