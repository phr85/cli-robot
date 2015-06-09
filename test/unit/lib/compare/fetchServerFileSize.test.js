"use strict";

var expect = require("chai").expect;

describe("fetchServerFileSize", function () {
  var fetchServerFileSize, successUrl, linkParser;

  before(function () {
    fetchServerFileSize = require("../../../../lib/compare/fetchServerFileSize");
    successUrl = "https://fetch-server-file-size.success";
  });

  beforeEach(function () {
    linkParser = /(html)/igm;
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