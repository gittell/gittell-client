/*global chrome*/  

var ActivityLog = require('./activity-log');

var MIN_STAY_THRESHOLD = 5000;
var ACTIVE_THRESHOLD = 30000;
var lastActivity = null;
var targetSites = [
  /^https?:\/\/github\.com\//,
  /^http:\/\/stackoverflow.com\//,
  /^http:\/\/qiita.com\//
];

chrome.tabs.onActivated.addListener(getActiveTabInfo);
chrome.tabs.onHighlighted.addListener(getActiveTabInfo);
chrome.tabs.onUpdated.addListener(getActiveTabInfo);

chrome.alarms.create("checkActive", { delayInMinutes: 1, periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(checkActivity);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  activate(sender.tab.url, sender.tab.title);
  sendResponse({});
});

getActiveTabInfo();

function checkActivity() {
  if (lastActivity) {
    var now = Date.now();
    var duration = now - lastActivity.timestamp;
    if (duration > ACTIVE_THRESHOLD) {
      deactivate();
    }
  }
}

function getActiveTabInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    activate(tab.url, tab.title);
  });
}

function activate(url, title) {
  var ts = Date.now();
  if (lastActivity) {
    var duration = ts - lastActivity.timestamp;
    if (duration > MIN_STAY_THRESHOLD) {
      accumulateActivity();
    } else {
      ts = lastActivity.timestamp;
    }
  }
  lastActivity = {
    url: url,
    title: title,
    timestamp: ts
  };
}

function deactivate() {
  accumulateActivity();
  lastActivity = null;
  console.log('Deactivated...');
}

function accumulateActivity() {
  if (lastActivity) {
    var url = lastActivity.url;
    if (isTargetSite(url)) {
      var duration = Date.now() - lastActivity.timestamp;
      var activityLog = ActivityLog.findByUrl(url);
      if (!activityLog) {
        activityLog = { url: url, title: lastActivity.title, totalDuration: 0 };
      }
      activityLog.title = lastActivity.title;
      activityLog.totalDuration += duration;
      console.log('Logging activity: total=', activityLog.totalDuration, ', delta=' + duration);
      ActivityLog.save(activityLog);
    }
  }
}

function isTargetSite(url) {
  for (var i=0, len = targetSites.length; i<len; i++) {
    var regexp = targetSites[i];
    if (regexp.test(url)) { return true; }
  }
  return false;
}
