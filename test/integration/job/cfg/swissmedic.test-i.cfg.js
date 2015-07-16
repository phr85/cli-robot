"use strict";

var path = require("path");

var server = require("../../../fixtures/server");

var cfg = {
  download: {
    url: "http://localhost:" + server.port + "/arzneimittel/00156/00221/00222/00230/index.html",
    dir: path.resolve(__dirname, "../../tmp/data/auto/swissmedic"),
    name: path.resolve(__dirname, "../../tmp/data/auto/swissmedic/swissmedic.xlsx")
  },
  manual: {},
  release: {
    dir: path.resolve(__dirname, "../../tmp/data/release/swissmedic"),
    file: path.resolve(__dirname, "../../tmp/data/release/swissmedic/swissmedic.json"),
    minFile: path.resolve(__dirname, "../../tmp/data/release/swissmedic/swissmedic.min.json")
  },
  history: {
    file: path.resolve(__dirname, "../../tmp/data/release/swissmedic/swissmedic.history.json"),
    minFile: path.resolve(__dirname, "../../tmp/data/release/swissmedic/swissmedic.history.min.json")
  },
  log: {
    "deRegistered": path.resolve(__dirname, "../../tmp/log/swissmedic/swissmedic.de-registered.log"),
    "changes": path.resolve(__dirname, "../../tmp/log/swissmedic/swissmedic.changes.log"),
    "new": path.resolve(__dirname, "../../tmp/log/swissmedic/swissmedic.new.log")
  }
};

cfg.manual.atcCorrections = path.resolve(__dirname, "../../../fixtures/manual/swissmedic/atc.csv");

module.exports = cfg;
