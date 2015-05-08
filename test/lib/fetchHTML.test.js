"use strict";

var fs = require("fs");
var path = require("path");

var chai = require("chai");
var expect = chai.expect;

chai.use(require("sinon-chai"));

var fakeAgent = require("../mocks/agent");

describe("fetchHTML", function () {
  var request, config, fetchHTML, url, ref;

  before(function () {
    fetchHTML = require("../../lib/fetchHTML");
    request = require("superagent");
    config = require("../sa-mocks/fetchHTML.sa-mock");
    url = "https://fetch.html.success.test";
    ref = fs.readFileSync(path.resolve(__dirname, "../../fixtures/html/swissmedic.html"), {encoding: "utf8"});

    require("superagent-mock")(request, config);
  });

  describe("Promise", function () {
    it("should return a Promise", function () {
      expect(fetchHTML(url)).to.be.an.instanceof(Promise);
    });

    describe(".resolve() ", function () {
      it("should resolve with fetched html", function (done) {
        fetchHTML(url)
          .then(function (result) {
            expect(result.html).to.equal(ref);
            done();
          })
          .catch(done);
      });
    });
  });

  describe("agent", function () {
    var agent, errRef, resRef;

    beforeEach(function () {
      errRef = null;
      resRef = {text: "<html><head></head><body></body></html>"};

      agent = fakeAgent(errRef, resRef);

      fetchHTML.setAgent(agent);
    });

    afterEach(function () {
      fetchHTML.setAgent(null);
    });

    it("should be possible to set an agent", function (done) {
      fetchHTML(url)
        .then(function (result) {
          expect(resRef).to.equal(result.res);
          done();
        })
        .catch(done);
    });

    it("should resolve with html, res and used agent", function (done) {
      fetchHTML(url)
        .then(function (result) {
          expect(result.html).to.equal(resRef.text);
          expect(result.res).to.equal(resRef);
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