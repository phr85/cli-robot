"use strict";

var path = require("path");

var rewire = require("rewire");
var shasum = require("shasum");
var merge = require("merge");
var xlsx = require("xlsx");
var expect = require("chai").expect;

describe("job: siwssmedic", function () {
  var swissmedicJob, atcCHJob, atcCHCfg, test;

  // create test config
  before(function () {
    test = { cfg: require("./cfg/swissmedic.test-i.cfg.js") };
  });
  // run job
  before(function (done) {
    var atcCfg = require("./cfg/atc.test-i.cfg");
    var atcJob = rewire("../../../jobs/atc");
    atcJob.__set__("cfg", merge.recursive(atcJob.__get__("cfg"), atcCfg));

    atcCHCfg = require("./cfg/atcCH.test-i.cfg");
    atcCHJob = rewire("../../../jobs/atcCH");
    atcCHJob.__set__({
      "cfg": merge.recursive(atcCHJob.__get__("cfg"), atcCHCfg),
      "atcJob": atcJob
    });

    swissmedicJob = rewire("../../../jobs/swissmedic");
    swissmedicJob.__set__({
      "cfg": merge.recursive(swissmedicJob.__get__("cfg"), test.cfg),
      "atcCHJob": atcCHJob
    });
    swissmedicJob().then(done).catch(done);
  });

  describe("XLSX-Download", function () {
    it("should download whole xlsx-File from swissmedic", function () {
      var fixture = shasum(xlsx.readFile(path.resolve(__dirname, "../../fixtures/auto/swissmedic/swissmedic.xlsx")));
      var build = shasum(xlsx.readFile(test.cfg.download.name));

      expect(fixture).to.equal(build);
    });
  });

  describe("Release", function () {
    describe("swissmedic", function () {
      describe("JSON Release", function () {
        it("should have build a proper JSON-file", function () {
          var fixture = require("../../fixtures/release/swissmedic/swissmedic.json");
          var jsonBuild = require(test.cfg.release.file);

          expect(jsonBuild).to.have.length(fixture.length);
          expect(jsonBuild).to.deep.equal(fixture);
        });
      });

      describe("JSON-Min Release", function () {
        it("should have build a proper minified JSON-file", function () {
          var fixture = require("../../fixtures/release/swissmedic/swissmedic.min.json");
          var jsonMinBuild = require(test.cfg.release.minFile);

          expect(jsonMinBuild).to.have.length(fixture.length);
          expect(jsonMinBuild).to.deep.equal(fixture);
        });
      });
    });

    describe("ATC-CH", function () {
      describe("JSON", function () {
        it("should have build a proper JSON-file", function () {
          var fixture = require("../../fixtures/release/atc/atc_de-ch.json");
          var jsonBuild = require(atcCHCfg.release.file);

          expect(shasum(jsonBuild)).to.equal(shasum(fixture));
        });
      });

      describe("JSON-Min", function () {
        it("should have build a proper minified JSON-file", function () {
          var fixture = require("../../fixtures/release/atc/atc_de-ch.min.json");
          var jsonMinBuild = require(atcCHCfg.release.minFile);

          expect(shasum(jsonMinBuild)).to.equal(shasum(fixture));
        });
      });
    });
  });
});