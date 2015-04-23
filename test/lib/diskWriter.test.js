"use strict";

var rewire = require("rewire");
var chai = require("chai");
var expect = chai.expect;

describe.skip("fileWriter", function () {
  var diskWriter, mkdirpMock, fsMock;

  before(function () {
    mkdirpMock = {sync: function () { /* do nothing */ }};
    fsMock = {writeFileSync: function () { /* do nothing */ }};

    diskWriter = rewire("../../lib/diskWriter");
    diskWriter.__set__({"fs": fsMock, "mkdirp": mkdirpMock});
  });

  describe("chaining", function () {
    it("should return a reference to itself", function () {
      expect(
        function () {
          diskWriter
            .ensureDir("tmp")
            .json([{"a": "A"}], "a.json")
            .jsonMin([{"b": "B"}], "b.json");
        }
      ).to.not.throw(Error);
    });
  });
});