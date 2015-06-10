"use strict";

var path = require("path");

var server = require("../../../fixtures/server");
var config = require('../../../../lib/common/config');

var cfg = config("swissmedic", {
  download: {
    url: "http://localhost:" + server.port + "/arzneimittel/00156/00221/00222/00230/index.html",
    file: "swissmedic.xlsx"
  },
  manual: {},
  release: {
    file: "swissmedic.json",
    minFile: "swissmedic.min.json"
  },
  history: {
    file: "swissmedic.history.json",
    minFile: "swissmedic.history.min.json"
  },
  log: {
    "deRegistered": "swissmedic.de-registered.log",
    "changes": "swissmedic.changes.log",
    "new": "swissmedic.new.log"
  }
}, path.resolve(__dirname, "../../tmp"));

cfg.manual.atcCorrections = path.resolve(__dirname, "../../../fixtures/manual/swissmedic/atc.csv");

module.exports = cfg;
