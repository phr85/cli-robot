"use strict";

var rewire = require("rewire");
var expect = require("chai").expect;

describe("swissmedic", function () {
  var job, cfg;

  before(function () {
    job = rewire("../../jobs/swissmedic");
    cfg = job.__get__("cfg");
  });

  describe("cfg", function () {
    it("should provide a reference to it's config", function () {
      expect(job.cfg).to.deep.equal(cfg);
    });
  });
});