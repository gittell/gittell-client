/*global describe, it, before, beforeEach, after, afterEach */
var assert = require("power-assert");
var _ = require("underscore");

var Site = require("../src/js/models/site");

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

  it("should find site by id", function() {
    Site.findById(1, function(err, site) {
      assert(site);
      assert(site.name === 'StackOverflow');
    });
  });

  it("should find site by url", function() {
    var url = 'http://stackoverflow.com/questions/22833467/passing-string-to-view-asyncronously-ajax'; //http://stackoverflow.com/questions/22598248/size-canvas-to-adjacent-labels-text-height';
    Site.findByUrl(url, function(err, site) {
      assert(site);
      assert(site.isIncluding({ url: url }));
      assert(site.name === 'StackOverflow');
    });
  });

  it("should include valid page", function() {
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
    var page1 = {
      url: "http://stackoverflow.com/questions/22833467/passing-string-to-view-asyncronously-ajax",
      title: "javascript - Passing string to view asyncronously (Ajax) - Stack Overflow"
    };
    var page2 = {
      url: "http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags?page=2&tab=votes",
      title: "html - RegEx match open tags except XHTML self-contained tags - Stack Overflow"
    };
    var invalidPage1 = {
      url: "http://careers.stackoverflow.com/jobs/51000/ruby-developer-elocal-usa-llc?a=10cnBoTuM&searchTerm=ruby",
      title: "Ruby Developer at eLocal USA LLC - Ruby On Rails - Stack Overflow Careers 2.0"
    };
    assert(site.isIncluding(page1));
    var cpage1 = site.canonicalize(page1);
    assert(cpage1.url === page1.url);
    assert(cpage1.title === page1.title);
    assert(site.isIncluding(page2));
    var cpage2 = site.canonicalize(page2);
    assert(cpage2.url === page2.url.split('?')[0]);
    assert(cpage2.title === page2.title);
    assert(!site.isIncluding(invalidPage1));
  });

  it("should include pages under project", function() {
    var site = new Site({
      id: 2,
      name: 'GitHub',
      icon: 'http://github.com/favicon.ico',
      mapping: {
        url: {
          regexp: "^https?://github.com/[\\w\\-\\.]+/[\\w\\-\\.]+(/[\\w\\-\\.]+)*",
          excludes: "^https?://github.com/(organizations|dashboard|settings)/"
        },
        projectUrl: {
          from: "url",
          regexp: "^https?://github.com/([\\w\\-\\.]+/[\\w\\-\\.]+)"
        },
        projectTitle: {
          from: "title",
          regexp: "\\s*([\\w\\-\\.]+/[\\w\\-\\.]+)$",
          index: 1
        },
        authorId: {
          from: "url",
          regexp: "^https?://github.com/([\\w\\-\\.]+)/",
          index: 1
        }
      }
    });
    var page1 = {
      url: "https://github.com/gruntjs/grunt",
      title: "gruntjs/grunt"
    };
    var page2 = {
      url: "https://github.com/gruntjs/grunt/issues?page=3&state=open",
      title: "Issues · gruntjs/grunt"
    };
    var page3 = {
      url: "https://github.com/gruntjs/grunt/pull/1103",
      title: "appveyor config update by vladikoff · Pull Request #1103 · gruntjs/grunt"
    };
    var invalidPage1 = {
      url: "https://github.com/dashboard/issues",
      title: "Your Issues"
    };
    var invalidPage2 = {
      url: "https://github.com/organizations/new",
      title: "Create an organization"
    };
    assert(site.isIncluding(page1));
    assert(site.isIncluding(page2));
    assert(site.isIncluding(page3));
    var cpage1 = site.canonicalize(page1);
    var cpage2 = site.canonicalize(page2);
    var cpage3 = site.canonicalize(page3);
    assert(cpage1.url === page1.url.split('?')[0]);
    assert(cpage2.url === page2.url.split('?')[0]);
    assert(cpage3.url === page3.url.split('?')[0]);
    assert(cpage1.title === page1.title);
    assert(cpage2.title === page2.title);
    assert(cpage3.title === page3.title);
    assert(cpage1.projectUrl === "https://github.com/gruntjs/grunt");
    assert(cpage2.projectUrl === "https://github.com/gruntjs/grunt");
    assert(cpage3.projectUrl === "https://github.com/gruntjs/grunt");
    assert(cpage1.projectTitle === "gruntjs/grunt");
    assert(cpage2.projectTitle === "gruntjs/grunt");
    assert(cpage3.projectTitle === "gruntjs/grunt");
    assert(cpage1.authorId === "gruntjs");
    assert(cpage2.authorId === "gruntjs");
    assert(cpage3.authorId === "gruntjs");
    assert(!site.isIncluding(invalidPage1));
    assert(!site.isIncluding(invalidPage2));
  });


});