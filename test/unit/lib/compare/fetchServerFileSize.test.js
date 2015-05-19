"use strict";

var request = require("superagent");
var expect = require("chai").expect;

describe("fetchServerFileSize", function () {
  var fetchServerFileSize, fetchServerFileSizeCfg, successUrl, linkParser;

  before(function () {
    fetchServerFileSize = require("../../../../lib/compare/fetchServerFileSize");
    fetchServerFileSizeCfg = require("../../sa-mocks/fetchServerFileSize.sa-mock");

    require("superagent-mock")(request, fetchServerFileSizeCfg);

    successUrl = fetchServerFileSizeCfg[0].pattern;
  });

  beforeEach(function () {
    linkParser = /href="(.*file\.ext)"/igm;
  });

  describe("Promise", function () {
    it("should return a Promise", function () {
      expect(fetchServerFileSize(successUrl, linkParser)).to.be.an.instanceof(Promise);
    });
  });

  describe("content-length resolution", function () {
    it("should resolve with correct server-file's size", function (done) {
      fetchServerFileSize(successUrl, linkParser)
        .then(function (file) {
          expect(file.size).to.equal(123456);
          done();
        })
        .catch(done);
    });
  });

});