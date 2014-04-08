/*global chrome*/  
var _ = require('underscore');

var ActivityLog = require('./activity-log');
var Site = require('./site');

var MIN_STAY_THRESHOLD = 5000;
var ACTIVE_THRESHOLD = 30000;
var lastAccess = null;

chrome.tabs.onActivated.addListener(getActiveTabInfo);
chrome.tabs.onHighlighted.addListener(getActiveTabInfo);
chrome.tabs.onUpdated.addListener(getActiveTabInfo);

chrome.alarms.create("checkActive", { delayInMinutes: 1, periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(checkActivity);

chrome.runtime.onMessage.addListener(receiveActivePageFromContent);

getActiveTabInfo();

function getActiveTabInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { message: "requestActivePage" });
    }
  });
}

function receiveActivePageFromContent(request, sender) {
  console.log('received active page: ', request.activePage);
  setLastAccess(request.activePage);
}

function checkActivity() {
  if (lastAccess) {
    var now = Date.now();
    var duration = now - lastAccess.timestamp;
    if (duration > ACTIVE_THRESHOLD) {
      setLastAccess(null);
    }
  }
}

function setLastAccess(page) {
  var ts = Date.now();
  if (lastAccess) {
    var duration = ts - lastAccess.timestamp;
    if ((page && lastAccess.page.url !== page.url) || duration > MIN_STAY_THRESHOLD) {
      storeActivity(function(err) {
        lastAccess = page ? { timestamp: ts, page: page } : null;
      });
    }
  } else {
    lastAccess = page ? { timestamp: ts, page: page } : null;
  }
}

function storeActivity(callback) {
  if (lastAccess) {
    var url = lastAccess.page.url;
    Site.findByUrl(url, function(err, site) {
      if (err) { return callback(err); }
      var activityLog = ActivityLog.findByUrl(url);
      if (!activityLog) {
        console.log('activity log not found. create new:');
        activityLog = { totalDuration: 0, page: lastAccess.page };
      }
      var duration = Date.now() - lastAccess.timestamp;
      activityLog.totalDuration += duration;
      console.log('Logging activity: url=' + activityLog.page.url + ', total=', activityLog.totalDuration, ', delta=' + duration);
      ActivityLog.save(activityLog);
      callback();
    });
  }
}

