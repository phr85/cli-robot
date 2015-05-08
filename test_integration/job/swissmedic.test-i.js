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
    test = {
      cfg: {
        download: {
          url: "http://localhost:" + server.port + "/arzneimittel/00156/00221/00222/00230/index.html",
          dir: path.resolve(__dirname, "../tmp/data/auto"),
          file: path.resolve(__dirname, "../tmp/data/auto/swissmedic.xlsx")
        },
        process: {
          dir: path.resolve(__dirname, "../tmp/data/release/swissmedic/"),
          file: path.resolve(__dirname, "../tmp/data/release/swissmedic/swissmedic.json"),
          minFile: path.resolve(__dirname, "../tmp/data/release/swissmedic/swissmedic.min.json"),
          atcFile: path.resolve(__dirname, "../../fixtures/manual/swissmedic/atc.csv")
        }
      }
    };
  });
  // run job
  before(function (done) {
    job = rewire("../../jobs/swissmedic");
    job.__set__("cfg", merge.recursive(require("../../jobs/swissmedic").cfg, test.cfg));
    job(done);
  });

  describe("XLSX-Download", function () {
    // @TODO use a smaller fixture
    it("should download whole xlsx-File from swissmedic", function () {
      this.timeout(50000);
      expect(shasum(xlsx.readFile(path.resolve(__dirname, "../../fixtures/auto/swissmedic.xlsx")))).to.equal(shasum(xlsx.readFile(test.cfg.download.file)));
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