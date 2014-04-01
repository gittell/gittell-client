/*global chrome*/  
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
      var activityLog = findActivityLog(url);
      if (!activityLog) {
        activityLog = { url: url, title: lastActivity.title, totalDuration: 0 };
      }
      lastActivity.totalDuration += duration;
      saveActivityLog(activityLog);
    }
  }
}

function zeropad(n) {
  return (n<10 ? "0" : "") + n;
}

function generateActivityLogKey(url) {
  var d = new Date();
  var today = "" + d.getFullYear() + zeropad(d.getMonth() + 1) + zeropad(d.getDate());
  return 'activity_log_' + today + '_' + encodeURIComponent(url);
}

function findActivityLog(url) {
  var key = generateActivityLogKey(url);
  var s = localStorage.getItem(key);
  return s && JSON.parse(s);
}

function saveActivityLog(activityLog) {
  var key = generateActivityLogKey(activityLog.url);
  localStorage.setItem(key, JSON.stringify(activityLog));
}

function isTargetSite(url) {
  for (var i=0, len = targetSites.length; i<len; i++) {
    var regexp = targetSites[i];
    if (regexp.test(url)) { return true; }
  }
  return false;
}

function printout() {
  var urls = [];
  var stayDurations = {};
  for (var url in stayDurations) {
    urls.push([ url, stayDurations[url] ]);
  }
  urls = urls.sort(function(u1, u2) {
    return u1[1] > u2[1] ? 1 : u1[1] < u2[1] ? -1 : 0;
  });
  console.clear();
  urls.forEach(function(url) {
    console.log(url[0] + ": " + url[1]);
  });
}
