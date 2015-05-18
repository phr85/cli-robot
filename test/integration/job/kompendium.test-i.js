"use strict";

var path = require("path");
var fs = require("fs");

var rewire = require("rewire");
var shasum = require("shasum");
var merge = require("merge");
var expect = require("chai").expect;

var server = require("../../fixtures/server");
var disk = require("../../../lib/common/disk");

describe("job: Kompendium", function () {
  var job, test;

  before(function () {
    test = { cfg: require("./cfg/kompendium.test-i.cfg") };
  });

  before(function (done) {
    job = rewire("../../../jobs/kompendium");
    job.__set__("cfg", merge.recursive(require("../../../jobs/cfg/kompendium.cfg"), test.cfg));
    job(done);
  });

  describe("Download and unzip kompendium.xml", function () {
    it("should download ZIP-File and unzip it to kompendium.xml", function () {
      var fixture = shasum(fs.readFileSync(path.resolve(__dirname, "../../fixtures/auto/kompendium/kompendium.xml")));
      var download = shasum(fs.readFileSync(test.cfg.download.xml));
      expect(fixture).to.equal(download);
    });
  });

  describe("Release", function () {
    describe("catalog.json", function () {
      it("should build a proper catalog.json-file", function () {
        var fixture = shasum(fs.readFileSync(path.resolve(__dirname, "../../fixtures/release/kompendium/catalog.json")));
        var build = shasum(fs.readFileSync(test.cfg.process.catalog));
        expect(fixture).to.equal(build);
      });
    });

    describe("JSON", function () {
      it("should have build a proper JSON-file", function () {
        var fixture = require("../../fixtures/release/kompendium/kompendium.json");
        var build = require(test.cfg.process.json);

        delete fixture.version;
        delete build.version;

        expect(shasum(fixture)).to.equal(shasum(build));
      });
    });

    describe("JSON-Min", function () {
      it("should have build a proper minified JSON-file", function () {
        var fixture = require("../../fixtures/release/kompendium/kompendium.min.json");
        var minBuild = require(test.cfg.process.jsonMin);

        delete fixture.version;
        delete minBuild.version;

        expect(shasum(fixture)).to.equal(shasum(minBuild));
      });
    });
  });
});