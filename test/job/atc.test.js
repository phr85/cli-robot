"use strict";

var rewire = require("rewire");
var expect = require("chai").expect;

describe("ATC", function () {
  var job, cfg;

  before(function () {
    job = rewire("../../jobs/atc");
    cfg = job.__get__("cfg");
  });

  describe("cfg", function () {
    it("should provide a reference to it's config", function () {
      expect(job.cfg).to.deep.equal(cfg);
    });
  });
});