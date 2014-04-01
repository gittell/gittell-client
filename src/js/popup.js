var Vue = require('vue');
var ActivityLog = require('./activity-log');

var filters = {
  formatDuration: function(ms) {
    try {
      var s = Math.floor(ms/1000);
      var m = Math.floor(s/60);
      var h = Math.floor(m/60);
      var d = Math.floor(h/24);
      return m < 1 ? s + " sec" :
             h < 1 ? m + " min" :
             d < 1 ? h + " hour" + (h>1 ? "s" : "") + (
                       h < 6 ? (m < 15 ? "" :
                                m < 30 ? "15 min" :
                                m < 45 ? "30 min" :
                                         "45 min") :
                       ""
                     ) :
             d + " day" + (d>1 ? "s" : "");
    } catch(e) {
      return "!ERR!";
    }
  },

  secondIndicator: function(ms) {
    var s = ms/1000;
    return s > 60 ? 100 : Math.floor(100*s/60);
  },

  minuteIndicator: function(ms) {
    var m = ms/(60 * 1000);
    return m > 60 ? 100 : Math.floor(100*m/60);
  },

  hourIndicator: function(ms) {
    var h = ms/(60 * 60 * 1000);
    return h > 24 ? 100 : Math.floor(100*h/24);
  },

  toStyleProperty: function(value, key, unit) {
    return key + ":" + value + (unit || "");
  }
};

for (var fname in filters) {
  Vue.filter(fname, filters[fname]);
}

document.addEventListener('DOMContentLoaded', init);

function init() {
  var logs = ActivityLog.find({}, 'totalDuration');
  var vm = new Vue({
    el: '#activity-logs',
    data: {
      logs: logs
    }
  });
}

