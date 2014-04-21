var _ = require('underscore');
var Site = require('./site');

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

function generateActivityLogKey(url) {
  return 'activity_log_' + getToday() + '_' + encodeURIComponent(url);
}

function save(activityLog) {
  var key = generateActivityLogKey(activityLog.page.url);
  activityLog.date = getToday();
  localStorage.setItem(key, JSON.stringify(activityLog));
}

function find(conditions, sort, callback) {
  conditions = conditions || {};
  conditions.date = conditions.date ? toISO8601Date(conditions.date) : getToday();
  var logs = [];
  for (var i=0, len=localStorage.length; i<len; i++) {
    var key = localStorage.key(i);
    if (key.indexOf('activity_log_') === 0) {
      var log = JSON.parse(localStorage.getItem(key));
      if ((!conditions.date || log.date === conditions.date) &&
          (!conditions.siteId || log.page.siteId === conditions.siteId)) {
        logs.push(log);
      }
    }
  }
  if (sort && sort === 'totalDuration') {
    logs = logs.sort(function (l1, l2) {
      return l1.totalDuration < l2.totalDuration ? 1 :
             l1.totalDuration > l2.totalDuration ? -1 : 0;
    });
  }
  callback(null, logs);
}

function findByUrl(url, callback) {
  var key = generateActivityLogKey(url);
  var s = localStorage.getItem(key);
  callback(null, s && JSON.parse(s));
}

function listLogGroups(conditions, sort, callback) {
  find(conditions, sort, function(err, logs) {
    var groups = {};
    logs.forEach(function(log) {
      log.page.site = sites[log.page.siteId];
      var groupUrl = log.page.projectUrl || log.page.url;
      var group = groups[groupUrl] || 
        (groups[groupUrl] = { totalDuration : 0, logs: [] });
      group.page = {
        site: log.page.site,
        url: groupUrl,
        title: log.page.projectTitle || log.page.title
      };
      group.totalDuration += log.totalDuration;
      group.logs.push(log);
    });
    groups = _.values(groups);
    if (sort && sort === 'totalDuration') {
      groups = groups.sort(function (g1, g2) {
        return g1.totalDuration < g2.totalDuration ? 1 :
               g1.totalDuration > g2.totalDuration ? -1 : 0;
      });
    } 
    callback(null, groups);
  });
}

module.exports = {
  save: save,
  find: find,
  findByUrl: findByUrl,
  listLogGroups: listLogGroups
};

