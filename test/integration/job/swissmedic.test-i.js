"use strict";

var path = require("path");

var rewire = require("rewire");
var shasum = require("shasum");
var merge = require("merge");
var xlsx = require("xlsx");
var expect = require("chai").expect;

var server = require("../../fixtures/server");

describe("job: siwssmedic", function () {
  var job, test;

  // create test config
  before(function () {
    test = { cfg: require("./cfg/swissmedic.test-i.cfg.js") };
  });
  // run job
  before(function (done) {
    job = rewire("../../../jobs/swissmedic");
    job.__set__("cfg", merge.recursive(require("../../../jobs/cfg/swissmedic.cfg"), test.cfg));
    job(done);
  });

  describe("XLSX-Download", function () {
    // @TODO use a smaller fixture
    it("should download whole xlsx-File from swissmedic", function () {
      expect(shasum(xlsx.readFile(path.resolve(__dirname, "../../fixtures/auto/swissmedic/swissmedic.xlsx")))).to.equal(shasum(xlsx.readFile(test.cfg.download.file)));
    });
  });

  describe("JSON Release", function () {
    it("should have build a proper JSON-file", function () {
      var fixture = require("../../fixtures/release/swissmedic/swissmedic.json");
      var jsonBuild = require(test.cfg.process.file);

      expect(jsonBuild).to.have.length(fixture.length);
      expect(jsonBuild).to.deep.equal(fixture);
    });
  });

  describe("JSON-Min Release", function () {
    it("should have build a proper minified JSON-file", function () {
      var fixture = require("../../fixtures/release/swissmedic/swissmedic.min.json");
      var jsonMinBuild = require(path.resolve(__dirname, "../../", test.cfg.process.minFile));

      expect(jsonMinBuild).to.have.length(fixture.length);
      expect(jsonMinBuild).to.deep.equal(fixture);
    });
  });
});