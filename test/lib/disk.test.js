"use strict";

var rewire = require("rewire");
var chai = require("chai");
var expect = chai.expect;

describe("disk", function () {
  var disk, mkdirpMock, mkdirpMockCB, fsMock, writeFileCB, data;

  before(function () {
    mkdirpMock = function (dir, callback) {
      mkdirpMockCB = callback;
    };
    fsMock = {
      writeFile: function (filename, data, callback) {
        writeFileCB = callback;
      }
    };

    disk = rewire("../../lib/disk");
    disk.__set__({"fs": fsMock, "mkdirp": mkdirpMock});

    data = [{"a": "A"}, {"b": "B"}, {"c": "C"}, {"d": "D"}];
  });

  describe(".ensureDir()", function () {
    it("should return a Promise", function () {
      expect(disk.ensureDir("tmp")).to.be.an.instanceof(Promise);
    });

    describe(".resolve()", function () {
      it("should resolve if given dir is ensured", function (done) {
        disk.ensureDir("tmp").then(function () {
          done();
        });
        mkdirpMockCB();
      });
    });

    describe(".reject()", function () {
      it("should reject if an error has occurred", function (done) {
        var ensureDirErr = new Error("Could not ensure dir");

        disk.ensureDir("tmp").catch(function (err) {
          expect(ensureDirErr).to.equal(err);
          done();
        });
        mkdirpMockCB(ensureDirErr);
      })
    });
  });

  describe(".read", function () {
    describe(".file", function () {
      //@TODO
    });
    describe(".csv", function () {
      //@TODO
    });
  });

  describe(".write", function () {
    describe(".json()", function () {
      it("should return a Promise", function () {
        expect(disk.write.json("file.json", data)).to.be.an.instanceof(Promise);
      });

      describe(".resolve()", function () {
        it("should resolve if json-file is written", function (done) {
          disk.write.json("file.json", data).then(function () {
            done();
          });
          writeFileCB();
        });
      });

      describe(".reject()", function () {
        it("should reject if an error has occurred while file writing", function (done) {
          var jsonFileErr = new Error("Could not write json");

          disk.write.json("file.json", data).catch(function (err) {
            expect(jsonFileErr).to.equal(err);
            done();
          });

          writeFileCB(jsonFileErr);
        })
      });
    });

    describe(".jsonMin()", function () {
      it("should return a Promise", function () {
        expect(disk.write.jsonMin("file.json", data)).to.be.an.instanceof(Promise);
      });

      describe(".resolve()", function () {
        it("should resolve if json-file is written", function (done) {
          disk.write.jsonMin("file.json", data).then(function () {
            done();
          });
          writeFileCB();
        });
      });

      describe(".reject()", function () {
        it("should reject if an error has occurred while file writing", function (done) {
          var jsonMinFileErr = new Error("Could not write min-json");

          disk.write.jsonMin("file.json", data).catch(function (err) {
            expect(jsonMinFileErr).to.equal(err);
            done();
          });

          writeFileCB(jsonMinFileErr);
        })
      });
    });
  });
});