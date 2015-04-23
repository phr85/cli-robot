"use strict";


var EventEmitter = require('events').EventEmitter;
var rewire = require("rewire");
var expect = require("chai").expect;

describe("downloadFile", function () {
  var downloadFile, link, dest;
  var fsMock = { createWriteStream: function (dest, opts) { /* do nothing*/ }};
  var saMock = new EventEmitter();
  saMock.get = function () {
    return saMock;
  };
  saMock.pipe = function () { /*do nothing */ };

  before(function () {
    downloadFile = rewire("../../lib/downloadFile");
    downloadFile.__set__({"fs": fsMock, "request": saMock});
  });

  describe("Promise", function () {
    it("should return a Promise", function () {
      expect(downloadFile(link, dest)).to.be.an.instanceof(Promise);
    });

    describe(".resolve()", function () {
      it("should resolved request when download has end", function (done) {
        downloadFile(link, dest).then(done);
        saMock.emit("end");
      });
    });

    describe(".reject()", function () {
      it("should reject request when download fails", function (done) {
        var dlErr = new Error("Unable to download file");

        downloadFile(link, dest).catch(function (err) {
          expect(dlErr).to.equal(err);
          done();
        });

        saMock.emit("error", dlErr);
      });
    });
  });
});