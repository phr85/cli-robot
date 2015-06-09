"use strict";

var fs = require("fs");
var path = require("path");

var chai = require("chai");
var expect = chai.expect;
var request = require("superagent");
var fakeAgent = require("../../mocks/agent");

describe("fetchHTML", function () {
  var fetchHTML, url, refHTML;

  before(function () {
    fetchHTML = require("../../../../lib/common/fetchHTML");
    url = "https://fetch.html.success.test";
    refHTML = fs.readFileSync(path.resolve(__dirname, "../../../fixtures/html/swissmedic.html"), {encoding: "utf8"});
  });


  describe("Promise", function () {
    it("should return a Promise", function () {
      expect(fetchHTML(url)).to.be.an.instanceof(Promise);
    });

    describe(".resolve() ", function () {
      it("should resolve with fetched html", function (done) {
        fetchHTML(url)
          .then(function (result) {
            expect(result.html).to.equal(refHTML);
            done();
          })
          .catch(done);
      });
    });
  });

  describe("agent", function () {
    var agent, resRef;

    beforeEach(function () {
      resRef = {text: refHTML, res: {text: refHTML}};

      agent = request.agent();

      fetchHTML.setAgent(agent);
    });

    afterEach(function () {
      fetchHTML.setAgent(null);
    });

    it("should be possible to set an agent", function (done) {
      fetchHTML(url)
        .then(function (result) {
          expect(resRef.res).to.deep.equal(result.res);
          done();
        })
        .catch(done);
    });

    it("should resolve with html, res and used agent", function (done) {
      fetchHTML(url)
        .then(function (result) {
          expect(result.html).to.equal(refHTML);
          expect(result.res).to.deep.equal(resRef.res);
          expect(result.agent).to.equal(agent);
          done();
        })
        .catch(done);
    });

    describe(".setAgent()", function () {
      it("should be chainable", function () {
        expect(fetchHTML.setAgent(agent)).to.equal(fetchHTML);
      });
    });
  });
});