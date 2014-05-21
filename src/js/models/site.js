var _ = require('underscore');
var url = require('url');
var Q = require('q');
var xhr = require('xhr');
var config = require('../config');
var AccessToken = require('./access-token');

var createProperty = function(name, config) {
  config = config || {};
  var from = config.from || name;
  var regexp = _.isString(config.regexp) ? new RegExp(config.regexp) : config.regexp;
  var excludes = _.isString(config.excludes) ? new RegExp(config.excludes) : config.excludes;
  var index = config.index;
  return function(env) {
    var value = env[from];
    if (excludes && excludes.test(value)) {
      return null;
    }
    if (regexp) {
      var m = regexp.exec(value);
      value = m ? m[index || 0] : null;
    }
    return value;
  };
};


var Site = module.exports = function(config) {
  this.id = config.id;
  this.url = config.url;
  this.title = config.title;
  this.iconUrl = config.iconUrl;
  var condition = this.condition = config.manifest.condition;
  condition.path = condition.path && {
    includes: new RegExp(condition.includes),
    excludes: condition.excludes && new RegExp(condition.excludes)
  };
  var properties = this.properties = {};
  Object.keys(config.manifest.mapping || {}).forEach(function(name) {
    properties[name] = createProperty(name, config.manifest.mapping[name]);
  });
  if (!properties.url) { properties.url = createProperty("url"); }
  if (!properties.title) { properties.title = createProperty("title"); }
};


Site.prototype = {

  isIncluding: function(page) {
    var condition = this.condition;
    var parsed = url.parse(page.url);
    if (condition.host !== parsed.host) {
      return false;
    }
    if (!condition.path.includes.test(parsed.path) ||
         (condition.path.excludes && condition.path.excludes.test(parsed.path))) {
      return false;
    }
    return true;
  },

  canonicalize: function(page) {
    var cpage = { siteId: this.id };
    var properties = this.properties;
    Object.keys(properties).forEach(function(prop) {
      cpage[prop] = properties[prop](page);
    });
    return cpage;
  }
};

var _sites;

Site.find = function(params, callback) {
  _sites = _sites || AccessToken.waitAuthorize().then(function() {
    var deferred = Q.defer();
    xhr({
      method: 'GET',
      url: config.apiBaseUrl + "/site",
      headers: AccessToken.getAuthorizationHeader(),
      json: true
    }, function(err, res, body) {
      if (err || res.statusCode >= 400) {
        deferred.reject(err || new Error(body.message));
      } else {
        var sites = body;
        sites = sites.map(function(config) { return new Site(config); });
        deferred.resolve(sites);
      }
    });
    return deferred.promise;
  }).then(function(sites) {
    setTimeout(function() { Site.resetCache(); }, 2*60*60*1000);
    return sites;
  });
  _sites.nodeify(callback);
};

Site.resetCache = function() {
  _sites = null;
};

Site.findById = function(id, callback) {
  Site.find({}, function(err, sites) {
    if (err) { return callback(err); }
    var site = _.find(sites, function(s) {
      return s.id === id;
    });
    callback(null, site);
  }); 
};

Site.findByUrl = function(url, callback) {
  Site.find({}, function(err, sites) {
    if (err) { return callback(err); }
    var site = _.find(sites, function(s) {
      return s.isIncluding({ url: url });
    });
    callback(null, site);
  });
};