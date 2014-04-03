/*global describe, it, before, beforeEach, after, afterEach */
var assert = require("power-assert");
var _ = require("underscore");

var Site = require("../src/js/site");

describe("site", function() {
  it("should find sites", function(done) {
    Site.find({}, function(err, sites) {
      assert(_.isArray(sites));
      sites.forEach(function(site) {
        assert(site instanceof Site);
        assert(_.isFunction(site.isIncluding));
      });
      done();
    });
  });

  var site = new Site({
    id: 1,
    name: 'StackOverflow',
    icon: 'http://stackoverflow.com/favicon.ico',
    mapping: {
      url: {
        regexp: "^(https?://stackoverflow.com/questions/\\d+/[\\w\\-]+)",
        index: 1
      }
    }
  });

  it("site should include valid page", function() {
    var page1 = {
      url: "http://stackoverflow.com/questions/22833467/passing-string-to-view-asyncronously-ajax",
      title: "javascript - Passing string to view asyncronously (Ajax) - Stack Overflow"
    };
    var page2 = {
      url: "http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags?page=2&tab=votes",
      title: "html - RegEx match open tags except XHTML self-contained tags - Stack Overflow"
    };
    assert(site.isIncluding(page1));
    var log1 = site.getAccessLog(page1);
    assert(log1.url === page1.url);
    assert(log1.title === page1.title);
    assert(site.isIncluding(page2));
    var log2 = site.getAccessLog(page2);
    assert(log2.url === page2.url.split('?')[0]);
    assert(log2.title === page2.title);
  });

});