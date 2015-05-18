"use strict";


var EventEmitter = require('events').EventEmitter;
var rewire = require("rewire");
var expect = require("chai").expect;

var fakeAgent = require("../../mocks/agent");

describe.skip("downloadFile", function () {
  var downloadFile, link, dest, errRef, resRef;
  var fsMock, saMock;

  before(function () {
    fsMock = { createWriteStream: function () { /* do nothing*/ }};
    saMock = fakeAgent(errRef = null, resRef = {})

    downloadFile = rewire("../../lib/downloadFile");
    downloadFile.__set__({"fs": fsMock, "request": saMock});
  });

  describe("Promise", function () {
    it("should return a Promise", function () {
      expect(downloadFile(link, dest)).to.be.an.instanceof(Promise);
    });

    describe(".resolve()", function () {
      it("should resolve request when download has end", function (done) {
        downloadFile(link, dest)
          .then(function () {
            done();
          })
          .catch(done);
        saMock.req.emit("end");
      });
    });

    describe(".reject()", function () {
      var dlErr;

      before(function () {
        dlErr = new Error("Unable to download file");
        saMock = fakeAgent(dlErr, undefined);
        downloadFile.__set__("request", saMock);
      });

      it("should reject request when download fails", function (done) {
        downloadFile(link, dest).catch(function (err) {
          expect(dlErr).to.equal(err);
          done();
        });

        saMock.req.emit("error", dlErr);
      });
    });
  });

  describe("agent", function () {
    describe(".setAgent()", function () {
      var agent, errRef, resRef;

      beforeEach(function () {
        agent = fakeAgent(errRef = null, resRef = {});
        downloadFile.setAgent(agent);
      });

      afterEach(function () {
        downloadFile.setAgent(null);
      });

      it("should be possible to set an agent", function (done) {
        downloadFile(link, dest)
          .then(function (result) {
            expect(result.agent).to.equal(agent);
            done();
          })
          .catch(done);

        agent.req.emit("end");
      });
    });
  });
});