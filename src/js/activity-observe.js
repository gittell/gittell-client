/*global chrome*/
function attachObserver() {
  window.addEventListener("mousemove", notifyActive, false);
  window.addEventListener("keydown", notifyActive, false);
  window.addEventListener("scroll", notifyActive, false);
}

function notifyActive() {
  console.log('notify active');
  window.removeEventListener("mousemove", notifyActive, false);
  window.removeEventListener("keydown", notifyActive, false);
  window.removeEventListener("scroll", notifyActive, false);
  chrome.runtime.sendMessage({ activated: Date.now() }, function(response) {});
  setTimeout(attachObserver, 5000);
}

attachObserver();