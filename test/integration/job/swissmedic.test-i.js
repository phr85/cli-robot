"use strict";

var path = require("path");

var rewire = require("rewire");
var shasum = require("shasum");
var merge = require("merge");
var xlsx = require("xlsx");
var expect = require("chai").expect;

var server = require("../../fixtures/server");

describe("job: siwssmedic", function () {
  var swissmedicJob, atcCHJob, atcCHCfg, test;

  // create test config
  before(function () {
    test = { cfg: require("./cfg/swissmedic.test-i.cfg.js") };
  });
  // run job
  before(function (done) {
    atcCHCfg = require("./cfg/atcCH.test-i.cfg");
    atcCHJob = rewire("../../../jobs/atcCH");
    atcCHJob.__set__("cfg", merge.recursive(require("../../../jobs/cfg/atcCH.cfg"), atcCHCfg));

    swissmedicJob = rewire("../../../jobs/swissmedic");
    swissmedicJob.__set__({
      "cfg": merge.recursive(require("../../../jobs/cfg/swissmedic.cfg"), test.cfg),
      "atcCHJob": atcCHJob
    });
    swissmedicJob(done);
  });

  describe("XLSX-Download", function () {
    it("should download whole xlsx-File from swissmedic", function () {
      var fixture = shasum(xlsx.readFile(path.resolve(__dirname, "../../fixtures/auto/swissmedic/swissmedic.xlsx")));
      var build = shasum(xlsx.readFile(test.cfg.download.file));

      expect(fixture).to.equal(build);
    });
  });

  describe("Release", function () {
    describe("swissmedic", function () {
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

    describe("ATC-CH", function () {
      describe("JSON", function () {
        it("should have build a proper JSON-file", function () {
          var fixture = require("../../fixtures/release/atc/atc_de-ch.json");
          var jsonBuild = require(atcCHCfg.process.atcCh);

          expect(shasum(jsonBuild)).to.equal(shasum(fixture));
        });
      });

      describe("JSON-Min", function () {
        it("should have build a proper minified JSON-file", function () {
          var fixture = require("../../fixtures/release/atc/atc_de-ch.min.json");
          var jsonMinBuild = require(atcCHCfg.process.atcChMin);

          expect(shasum(jsonMinBuild)).to.equal(shasum(fixture));
        });
      });
    });
  });
});