"use strict";

var fs = require("fs");
var path = require("path");

var expect = require("chai").expect;

describe("fetchHTML", function () {
  var request, config, fetchHTML, url, ref;

  before(function () {
    fetchHTML = require("../../lib/fetchHTML");
    request = require("superagent");
    config = require("../sa-mocks/fetchHTML.sa-mock");
    url = "https://fetch.html.success.test";
    ref = fs.readFileSync(path.resolve(__dirname, "../fixtures/www.swissmedic.ch.html"), {encoding: "utf8"});

    require("superagent-mock")(request, config);
  });

  describe("Promise", function () {
    it("should return a Promise", function () {
      expect(fetchHTML(url)).to.be.an.instanceof(Promise);
    });

    describe(".then(html)", function () {
      it("should resolve with fetched html", function (done) {
        fetchHTML(url).then(function (html) {
          expect(html).to.equal(ref);
          done();
        })
      });
    });
  });
});