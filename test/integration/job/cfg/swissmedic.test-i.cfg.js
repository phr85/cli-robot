"use strict";

var path = require("path");

var server = require("../../../fixtures/server");

module.exports = {
  download: {
    url: "http://localhost:" + server.port + "/arzneimittel/00156/00221/00222/00230/index.html",
    dir: path.resolve(__dirname, "../../tmp/data/auto/swissmedic"),
    file: path.resolve(__dirname, "../../tmp/data/auto/swissmedic/swissmedic.xlsx")
  },
  process: {
    dir: path.resolve(__dirname, "../../tmp/data/release/swissmedic/"),
    file: path.resolve(__dirname, "../../tmp/data/release/swissmedic/swissmedic.json"),
    minFile: path.resolve(__dirname, "../../tmp/data/release/swissmedic/swissmedic.min.json"),
    atcFile: path.resolve(__dirname, "../../../fixtures/manual/swissmedic/atc.csv")
  }
};