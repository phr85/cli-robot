"use strict";

var rewire = require("rewire");
var server = require("../server");

describe("job: siwssmedic", function () {
  var job, config;

  before(function (done) {
    config = require("../../config.json");

    job = rewire("../../jobs/swissmedic");
    job.__set__("cfg", {
      download: {
        url: "http://localhost:" + server.port + "/arzneimittel/00156/00221/00222/00230/index.html",
        dir: "./test_integration/tmp/data/auto",
        file: "./test_integration/tmp/data/auto/swissmedic.xlsx"
      },
      process: {
        dir: "./test_integration/tmp/data/release/swissmedic/",
        file: "./test_integration/tmp/data/release/swissmedic/swissmedic.json",
        minFile: "./test_integration/tmp/data/release/swissmedic/siwssmedic.min.json"
      }
    });

    server.spinUp(done);
  });

  it("should download and process xlsx-file properly", function (done) {
    job(function () {
      //@TODO assertions, e.g. file size and
      done();
    });
  });

  after(server.spinDown);
});