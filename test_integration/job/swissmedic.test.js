"use strict";

var path = require("path");

var rewire = require("rewire");
var shasum = require("shasum");
var xlsx = require("xlsx");
var expect = require("chai").expect;

var server = require("../server");

describe("job: siwssmedic", function () {
  var job, test;

  // create test config
  before(function () {
    test = {
      cfg: {
        download: {
          url: "http://localhost:" + server.port + "/arzneimittel/00156/00221/00222/00230/index.html",
          dir: "./test_integration/tmp/data/auto",
          file: "./test_integration/tmp/data/auto/swissmedic.xlsx"
        },
        process: {
          dir: "./test_integration/tmp/data/release/swissmedic/",
          file: "./test_integration/tmp/data/release/swissmedic/swissmedic.json",
          atcFile: path.resolve(__dirname, "../../data/manual/swissmedic/atc.csv"),
          minFile: "./test_integration/tmp/data/release/swissmedic/swissmedic.min.json"
        }
      }
    };
  });
  // run job
  before(function (done) {
    job = rewire("../../jobs/swissmedic");
    job.__set__("cfg", test.cfg);
    job(done);
  });

  describe("XLSX-Download", function () {
    // @TODO use a smaller fixture
    it("should download whole xlsx-File from swissmedic", function () {
      this.timeout(50000);
      expect(shasum(xlsx.readFile(server.cfg.swissmedic.xlsx))).to.equal(shasum(xlsx.readFile(test.cfg.download.file)));
    });
  });

  describe("JSON Release", function () {
    it("should have build a proper JSON-file", function () {
      var fixture = require("../fixtures/swissmedic/swissmedic.json");
      var jsonBuild = require(path.resolve(__dirname, "../../", test.cfg.process.file));

      expect(jsonBuild).to.have.length(fixture.length);
      expect(jsonBuild).to.deep.equal(fixture);
    });
  });

  describe("JSON-Min Release", function () {
    it("should have build a proper minified JSON-file", function () {
      var fixture = require("../fixtures/swissmedic/swissmedic.min.json");
      var jsonMinBuild = require(path.resolve(__dirname, "../../", test.cfg.process.minFile));

      expect(jsonMinBuild).to.have.length(fixture.length);
      expect(jsonMinBuild).to.deep.equal(fixture);
    });
  });
});