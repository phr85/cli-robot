"use strict";

var path = require("path");
var fs = require("fs");

var rewire = require("rewire");
var shasum = require("shasum");
var merge = require("merge");
var xlsx = require("xlsx");
var expect = require("chai").expect;

var server = require("../../fixtures/server");
var disk = require("../../../lib/common/disk");

describe("job: ATC", function () {
  var atc, atcCH, swissmedic, swissmedicCfg, test;

  before(function () {
    test = { cfg: require("./cfg/atc.test-i.cfg") };
  });

  before(function (done) {
    atc = rewire("../../../jobs/atc");
    atc.__set__({"cfg": merge.recursive(require("../../../jobs/cfg/atc.cfg"), test.cfg)});
    atc(done);
  });

  describe("Zip download and unzip XLSX", function () {
    it("should download ZIP-File and unzip it to atc.xlsx", function () {
      var fixture = shasum(xlsx.readFile(path.resolve(__dirname, "../../fixtures/auto/atc/atc.xlsx")));
      var download = shasum(xlsx.readFile(test.cfg.download.zipFiles[0].dest));
      expect(fixture).to.equal(download);
    });
  });

  describe("Release", function () {
    describe("DE", function () {
      describe("JSON", function () {
        it("should have build a proper JSON-file", function () {
          var fixture = require("../../fixtures/release/atc/atc.json");
          var jsonBuild = require(test.cfg.process.atcDe);

          expect(shasum(jsonBuild)).to.equal(shasum(fixture));
        });
      });

      describe("JSON-Min", function () {
        it("should have build a proper minified JSON-file", function () {
          var fixture = require("../../fixtures/release/atc/atc.min.json");
          var jsonMinBuild = require(test.cfg.process.atcDeMin);

          expect(shasum(jsonMinBuild)).to.equal(shasum(fixture));
        });
      });
      describe("CSV", function () {
        it("should release a proper CSV-File", function (done) {
          Promise
            .all([
              disk.read.csv(path.resolve(__dirname, "../../fixtures/release/atc/atc.csv")),
              disk.read.csv(test.cfg.process.csv)
            ])
            .then(function (csvs) {
              var fixture = csvs[0];
              var release = csvs[1];

              expect(shasum(release)).to.equal(shasum(fixture));
            })
            .then(done)
            .catch(done);
        });
      });
    });
  });
});