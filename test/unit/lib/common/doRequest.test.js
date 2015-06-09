"use strict";

var expect = require("chai").expect;
var rewire = require("rewire");

describe("doRequest", function () {
  var request, doRequest, successLink;

  before(function () {
    request = require("superagent");
    doRequest = rewire("../../../../lib/common/doRequest");
    successLink = "https://do-request.success";
  });

  describe(".setAgent()", function () {
    var agent;

    beforeEach(function () {
      agent = request.agent();
      doRequest.setAgent(agent);
    });

    afterEach(function () {
      doRequest.setAgent(null);
    });

    it("should return a reference to itself", function () {
      expect(doRequest.setAgent(agent)).to.equal(doRequest);
    });

    it("should be possible to set a custom request-agent", function () {
      expect(doRequest.__get__("_agent")).to.equal(agent);
    });
  });

  describe(".setPreparedReq()", function () {
    var req;

    beforeEach(function () {
      req = request.post(successLink).type("form").send({"ep": "ha"});
      doRequest.setPreparedReq(req);
    });

    after(function () {
      // clean up for other tests
      doRequest.setPreparedReq(null);
    });

    it("should return a reference to itself", function () {
      expect(doRequest.setPreparedReq(req)).to.equal(doRequest);
    });

    it("should be possible to set a custom request-agent", function () {
      expect(doRequest.__get__("_req")).to.equal(req);
    });
  });

  describe("on success", function () {
    it("should resolve with an object containing Request, Response and used agent", function (done) {
      doRequest(successLink, function (err, result) {
        if (err) {
          return done(err);
        }
        expect(result.req.url).to.equal(successLink);
        expect(result.res).to.be.an("object");
        expect(result.agent).to.be.a("function");
        done();
      });
    });
  });
});