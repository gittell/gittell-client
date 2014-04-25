var querystring = require('querystring');
var xhr = require('xhr');
var _ = require('underscore');
var AccessToken = require('./access-token');
var Site = require('./site');
var config = require('../config');

var sites = {};
Site.find({}, function(err, _sites) {
  _sites.forEach(function(site) {
    sites[site.id] = site;
  });
});

function zeropad(n) {
  return (n<10 ? "0" : "") + n;
}

function getToday() {
  return toISO8601Date(new Date());
}

function toISO8601Date(d) {
  if (typeof d === 'number') { d = new Date(d); }
  return "" + d.getFullYear() + zeropad(d.getMonth() + 1) + zeropad(d.getDate());
}

function create(activity, callback) {
  activity.date = activity.date || getToday();
  console.log("activity=", activity);
  xhr({
    method: 'POST',
    url: config.apiBaseUrl + "/activity",
    headers: AccessToken.getAuthorizationHeader(),
    json: activity
  }, function(err, res, body) {
    callback(err, body);
  });
}

function incrementDuration(activityId, duration, callback) {
  xhr({
    method: 'POST',
    url: config.apiBaseUrl + "/activity/" + activityId + "/duration",
    headers: AccessToken.getAuthorizationHeader(),
    json: { "inc": duration }
  }, function(err, res, body) {
    callback(err, body);
  });
}

function listSummary(conditions, sort, callback) {
  conditions = conditions || {};
  var query = {};
  query.date = conditions.date ? toISO8601Date(conditions.date) : getToday();
  var userId = conditions.userId || "me";
  xhr({
    method: 'GET',
    url: config.apiBaseUrl + "/user/" + userId + "/activity/summary?" + querystring.stringify(query),
    headers: AccessToken.getAuthorizationHeader(),
    json: true
  }, function(err, res, logs) {
    if (err || res.statusCode >= 400) {
      callback(err || new Error(res.statusText));
    }
    callback(null, logs);
  });
}

module.exports = {
  create: create,
  incrementDuration: incrementDuration,
  listSummary: listSummary
};

