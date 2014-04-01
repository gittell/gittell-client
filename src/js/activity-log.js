function zeropad(n) {
  return (n<10 ? "0" : "") + n;
}

function getToday() {
  var d = new Date();
  return "" + d.getFullYear() + zeropad(d.getMonth() + 1) + zeropad(d.getDate());
}

function generateActivityLogKey(url) {
  return 'activity_log_' + getToday() + '_' + encodeURIComponent(url);
}

function findByUrl(url) {
  var key = generateActivityLogKey(url);
  var s = localStorage.getItem(key);
  return s && JSON.parse(s);
}

function save(activityLog) {
  var key = generateActivityLogKey(activityLog.url);
  activityLog.date = getToday();
  localStorage.setItem(key, JSON.stringify(activityLog));
}

function find(conditions, sort) {
  conditions = conditions || {};
  if (!conditions.date) { conditions.date = getToday(); }
  var logs = [];
  for (var i=0, len=localStorage.length; i<len; i++) {
    var key = localStorage.key(i);
    if (key.indexOf('activity_log_') === 0) {
      var log = JSON.parse(localStorage.getItem(key));
      if ((!conditions.date || log.date === conditions.date) &&
          (!conditions.site || log.url.split('/')[0] === conditions.site)) {
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
  return logs;
}

module.exports = {
  save: save,
  findByUrl: findByUrl,
  find: find
};

