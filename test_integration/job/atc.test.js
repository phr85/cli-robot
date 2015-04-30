"use strict";

var path = require("path");
var fs = require("fs");

var rewire = require("rewire");
var shasum = require("shasum");
var xlsx = require("xlsx");
var expect = require("chai").expect;

var server = require("../server");
var disk = require("../../lib/disk");

describe("job: ATC", function () {
  var job, test;

  before(function () {
    test = {
      cfg: {
        "download": {
          "url": "http://localhost:" + server.port + "/amtl_atc-code.html",
          "dir": path.resolve(__dirname, "../../test_integration/tmp/data/auto"),
          "file": path.resolve(__dirname, "../../test_integration/tmp/data/auto/atc.zip")
        },
        "manual": {
          "addFile": path.resolve(__dirname, "../../data/manual/atc/add.csv"),
          "capitalizeFile": path.resolve(__dirname, "../../data/manual/atc/capitalize.csv"),
          "changeFile": path.resolve(__dirname, "../../data/manual/atc/change.csv")
        },
        "process": {
          "xlsx": path.resolve(__dirname, "../../test_integration/tmp/data/auto/atc.xlsx"),
          "dir": path.resolve(__dirname, "../../test_integration/tmp/data/release/atc"),
          "atcDe": path.resolve(__dirname, "../../test_integration/tmp/data/release/atc/atc.json"),
          "atcDeMin": path.resolve(__dirname, "../../test_integration/tmp/data/release/atc/atc.min.json"),
          "atcCh": path.resolve(__dirname, "../../test_integration/tmp/data/release/atc/atc_de-ch.json"),
          "atcChMin": path.resolve(__dirname, "../../test_integration/tmp/data/release/atc/atc_de-ch.min.json"),
          "csv": path.resolve(__dirname, "../../test_integration/tmp/data/release/atc/atc.csv")
        }
      }
    };
  });

  before(function (done) {
    job = rewire("../../jobs/atc");
    job.__set__("cfg", test.cfg);
    job(done);
  });

  describe("Zip download and unzip XLSX", function () {
    it("should download ZIP-File and unzip it to atc.xlsx", function () {
      expect(shasum(xlsx.readFile(server.cfg.atc.xlsx))).to.equal(shasum(xlsx.readFile(test.cfg.process.xlsx)));
    });
  });

  describe("Release", function () {
    describe("DE", function () {
      describe("JSON", function () {
        it("should have build a proper JSON-file", function () {
          var fixture = require("../fixtures/atc/atc.json");
          var jsonBuild = require(test.cfg.process.atcDe);

          expect(shasum(jsonBuild)).to.equal(shasum(fixture));
        });
      });

      describe("JSON-Min", function () {
        it("should have build a proper minified JSON-file", function () {
          var fixture = require("../fixtures/atc/atc.min.json");
          var jsonMinBuild = require(test.cfg.process.atcDeMin);

          expect(shasum(jsonMinBuild)).to.equal(shasum(fixture));
        });
      });
      describe("CSV", function () {
        it("should release a proper CSV-File", function (done) {
          Promise
            .all([
              disk.read.csv(path.resolve(__dirname, "../fixtures/atc/atc.csv")),
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
          var fixture = require("../fixtures/atc/atc_de-ch.json");
          var jsonBuild = require(test.cfg.process.atcCh);

          expect(shasum(jsonBuild)).to.equal(shasum(fixture));
        });
      });

      describe("JSON-Min", function () {
        it("should have build a proper minified JSON-file", function () {
          var fixture = require("../fixtures/atc/atc_de-ch.min.json");
          var jsonMinBuild = require(test.cfg.process.atcChMin);

          expect(shasum(jsonMinBuild)).to.equal(shasum(fixture));
        });
      });
    });
  });
});