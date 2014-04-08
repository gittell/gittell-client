/*global chrome*/
var Site = require('./site');

function attachObserver() {
  window.addEventListener("load", notifyActivePageInInterval, false);
  window.addEventListener("mousemove", notifyActivePageInInterval, false);
  window.addEventListener("keydown", notifyActivePageInInterval, false);
  window.addEventListener("scroll", notifyActivePageInInterval, false);
}

function notifyActivePageInInterval() {
  window.removeEventListener("load", notifyActivePageInInterval, false);
  window.removeEventListener("mousemove", notifyActivePageInInterval, false);
  window.removeEventListener("keydown", notifyActivePageInInterval, false);
  window.removeEventListener("scroll", notifyActivePageInInterval, false);
  notifyActivePageToBackground();
  setTimeout(attachObserver, 5000);
}

function notifyActivePageToBackground() {
  Site.findByUrl(location.href, function(err, site) {
    var activePage = null;
    if (site) {
      activePage = site.canonicalize({
        url: location.href,
        title: document.title,
        document: document
      });
    }
    chrome.runtime.sendMessage({ activePage: activePage });
  });
}

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.message === "requestActivePage") {
    notifyActivePageToBackground();
  }
});

attachObserver();