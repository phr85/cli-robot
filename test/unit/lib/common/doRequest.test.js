"use strict";

var expect = require("chai").expect;
var rewire = require("rewire");

describe("requestFile", function () {
  var request, requestCfg, requestFile, successLink;

  before(function () {
    request = require("superagent");
    requestCfg = require("../../sa-mocks/requestFile.sa-mock");
    requestFile = rewire("../../../../lib/common/doRequest");

    require("superagent-mock")(request, requestCfg);

    successLink = "https://request.file.success";
  });

  describe(".setAgent()", function () {
    var agent;

    beforeEach(function () {
      requestFile.setAgent(agent);
    });

    afterEach(function () {
      requestFile.setAgent(null);
    });

    it("should return a reference to itself", function () {
      expect(requestFile.setAgent(agent)).to.equal(requestFile);
    });

    it("should be possible to set a custom request-agent", function () {
      expect(requestFile.__get__("_agent")).to.equal(agent);
    });
  });

  describe(".setPreparedReq()", function () {
    var req;

    beforeEach(function () {
      req = request.post(successLink).type("form").send({"ep": "ha"});
      requestFile.setPreparedReq(req);
    });

    afterEach(function () {
      requestFile.setPreparedReq(null);
    });

    it("should return a reference to itself", function () {
      expect(requestFile.setPreparedReq(req)).to.equal(requestFile);
    });

    it("should be possible to set a custom request-agent", function () {
      expect(requestFile.__get__("_req")).to.equal(req);
    });
  });

  describe("on success", function () {
    it("should resolve with an object containing Request, Response and used agent", function (done) {
      requestFile(successLink, function (err, result) {
        if (err) {
          return done(err);
        }
        expect(result.req.url).to.equal(successLink);
        expect(result.res).to.be.an.instanceof(require("http").IncomingMessage);
        expect(result.agent).to.be.a("function");
        done();
      });
    });
  });

  describe("on error", function () {
    it("should reject if anything goes wrong", function (done) {
      requestFile("does not exist", function (err) {
        if (err) {
          expect(err).to.be.an.instanceof(Error);
          return done();
        }

        done(new Error("It should not resolve, but reject."));
      });
    });
  });
});