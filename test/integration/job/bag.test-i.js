"use strict";

var path = require("path");
var fs = require("fs");

var rewire = require("rewire");
var shasum = require("shasum");
var merge = require("merge");
var expect = require("chai").expect;

describe("job: BAG", function () {
  var job, test;

  before(function () {
    test = { cfg: require("./cfg/bag.test-i.cfg.js") };
  });

  before(function (done) {
    job = rewire("../../../jobs/bag");
    job.__set__("cfg", merge.recursive(require("../../../jobs/cfg/bag.cfg"), test.cfg));
    job().then(done).catch(done);
  });

  describe("download and unzip", function () {

    it("should have unzipped bag.xls", function () {
      var fixture = shasum(fs.readFileSync(path.resolve(__dirname, "../../fixtures/auto/bag/bag.xml"), {encoding: "utf8"}));
      var download = shasum(fs.readFileSync(test.cfg.download.zipFiles[0].dest, {encoding: "utf8"}));

      expect(fixture).to.equal(download);
    });

    it("should have unzipped bag.xml", function () {
      var fixture = shasum(fs.readFileSync(path.resolve(__dirname, "../../fixtures/auto/bag/bag.xls"), {encoding: "utf8"}));
      var download = shasum(fs.readFileSync(test.cfg.download.zipFiles[1].dest, {encoding: "utf8"}));

      expect(fixture).to.equal(download);
    });

    it("should have unzipped it.xml", function () {
      var fixture = shasum(fs.readFileSync(path.resolve(__dirname, "../../fixtures/auto/bag/it.xml"), {encoding: "utf8"}));
      var download = shasum(fs.readFileSync(test.cfg.download.zipFiles[2].dest, {encoding: "utf8"}));

      expect(fixture).to.equal(download);
    });
  });

  describe("Release", function () {
    describe("JSON", function () {
      it("should have build a proper JSON-file", function () {
        var fixture = shasum(require("../../fixtures/release/bag/bag.json"));
        var jsonBuild = shasum(require(test.cfg.release.file));

        expect(jsonBuild).to.equal(fixture);
      });
    });

    describe("JSON-Min", function () {
      it("should have build a proper minified JSON-file", function () {
        var fixture = shasum(require("../../fixtures/release/bag/bag.min.json"));
        var jsonMinBuild = shasum(require(test.cfg.release.minFile));

        expect(jsonMinBuild).to.equal(fixture);
      });
    });
  });

  describe("IT", function () {
    describe("JSON", function () {
      it("should have build a proper JSON-file", function () {
        var fixture = shasum(require("../../fixtures/release/bag/it.json"));
        var jsonBuild = shasum(require(test.cfg.release.it));

        expect(jsonBuild).to.equal(fixture);
      });
    });

    describe("JSON-Min", function () {
      it("should have build a proper minified JSON-file", function () {
        var fixture = shasum(require("../../fixtures/release/bag/it.min.json"));
        var jsonMinBuild = shasum(require(test.cfg.release.itMin));

        expect(jsonMinBuild).to.equal(fixture);
      });
    });
  });
});