/* global chrome */
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
  var canoLink = document.querySelector('link[rel=canonical]');
  var activePage = {
    url: (canoLink || location).href,
    title: document.title
  };
  chrome.runtime.sendMessage({ activePage: activePage });
}

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.message === "requestActivePage") {
    notifyActivePageToBackground();
  }
});

attachObserver();