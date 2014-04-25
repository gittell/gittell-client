/*global chrome*/  
var _ = require('underscore');
var Q = require('q');

var Activity = require('./models/activity');
var Site = require('./models/site');

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
  var activePage = request.activePage;
  console.log('active page: ' + activePage.url);
  Site.findByUrl(activePage.url, function(err, site) {
    if (site) {
      console.log('The active page matched to subscribing site: ', site.title);
      activePage = site.canonicalize(activePage);
      logAccess(activePage);
    } else {
      console.log('The active page is not in the site you subscribing.');
      logAccess(null);
    }
  });
}

function checkActivity() {
  if (lastAccess) {
    var now = Date.now();
    var duration = now - lastAccess.timestamp;
    if (duration > ACTIVE_THRESHOLD) {
      console.log('Time passed with no activity from last access. Deactivating...');
      logAccess(null);
    }
  }
}

var logger;

function logAccess(page) {
  serialize(function(next) {
    var ts = Date.now();
    if (lastAccess) {
      var duration = ts - lastAccess.timestamp;
      duration = ACTIVE_THRESHOLD > duration ? duration : ACTIVE_THRESHOLD;
      var lastPage = lastAccess.page;
      var lastActivityId = lastAccess.activityId;
      if (lastActivityId) {
        console.log("Increment duration of ongoing activity...");
        Activity.incrementDuration(lastActivityId, duration, function() {
          console.log('...done');
          lastAccess = page ? { timestamp: ts, page: page } : null;
          if (page && page.url === lastPage.url) {
            lastAccess.activityId = lastActivityId;
          }
          next();
        });
      } else if (duration > MIN_STAY_THRESHOLD) {
        console.log("Storing activity...");
        var activity = {
          url: lastPage.url,
          title: lastPage.title,
          projectUrl: lastPage.projectUrl,
          projectTitle: lastPage.projectTitle,
          siteId: lastPage.siteId,
          since: ts,
          duration: duration
        };
        Activity.create(activity, function(err, ret) {
          console.log('...done');
          if (ret) {
            lastAccess = page ? { activityId: ret.id, timestamp: ts, page: page } : null;
          }
          next();
        });
      } else {
        console.log("Not enough time passed from last access, waiting next activation signal...");
        next();
      }
    } else {
      console.log("No last access in watching site");
      lastAccess = page ? { timestamp: ts, page: page } : null;
      next();
    }
  });
}

var serialize = (function() {
  var promise;
  return function serialize(fn) {
    promise = Q(promise || true).then(function() {
      var deferred = Q.defer();
      fn(function() {
        deferred.resolve();
      });
      setTimeout(function() { 
        deferred.resolve();
      }, 10000);
      return deferred.promise;
    });
  };
})();

