"use strict";

var path = require("path");
var fs = require("fs");

var rewire = require("rewire");
var shasum = require("shasum");
var merge = require("merge");
var xlsx = require("xlsx");
var expect = require("chai").expect;

var server = require("../../fixtures/server");
var disk = require("../../lib/disk");

describe("job: ATC", function () {
  var job, test;

  before(function () {
    test = {
      cfg: {
        "download": {
          "url": "http://localhost:" + server.port + "/amtl_atc-code.html",
          "dir": path.resolve(__dirname, "../tmp/data/auto"),
          "file": path.resolve(__dirname, "../tmp/data/auto/atc.zip"),
          "zipFiles": [{
            name: /widode.xlsx/, dest: path.resolve(__dirname, "../tmp/data/auto/atc.xlsx")
          }]
        },
        "manual": {
          "addFile": path.resolve(__dirname, "../../fixtures/manual/atc/add.csv"),
          "capitalizeFile": path.resolve(__dirname, "../../fixtures/manual/atc/capitalize.csv"),
          "changeFile": path.resolve(__dirname, "../../fixtures/manual/atc/change.csv")
        },
        "process": {
          "dir": path.resolve(__dirname, "../tmp/data/release/atc"),
          "atcDe": path.resolve(__dirname, "../tmp/data/release/atc/atc.json"),
          "atcDeMin": path.resolve(__dirname, "../tmp/data/release/atc/atc.min.json"),
          "atcCh": path.resolve(__dirname, "../tmp/data/release/atc/atc_de-ch.json"),
          "atcChMin": path.resolve(__dirname, "../tmp/data/release/atc/atc_de-ch.min.json"),
          "csv": path.resolve(__dirname, "../tmp/data/release/atc/atc.csv")
        }
      }
    };
  });

  before(function (done) {
    job = rewire("../../jobs/atc");
    job.__set__("cfg", merge.recursive(require("../../jobs/atc").cfg, test.cfg));
    job(done);
  });

  describe("Zip download and unzip XLSX", function () {
    it("should download ZIP-File and unzip it to atc.xlsx", function () {
      var fixture = shasum(xlsx.readFile(path.resolve(__dirname, "../../fixtures/auto/atc.xlsx")));
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

    describe("DE-CH", function () {
      describe("JSON", function () {
        it("should have build a proper JSON-file", function () {
          var fixture = require("../../fixtures/release/atc/atc_de-ch.json");
          var jsonBuild = require(test.cfg.process.atcCh);

          expect(shasum(jsonBuild)).to.equal(shasum(fixture));
        });
      });

      describe("JSON-Min", function () {
        it("should have build a proper minified JSON-file", function () {
          var fixture = require("../../fixtures/release/atc/atc_de-ch.min.json");
          var jsonMinBuild = require(test.cfg.process.atcChMin);

          expect(shasum(jsonMinBuild)).to.equal(shasum(fixture));
        });
      });
    });
  });
});