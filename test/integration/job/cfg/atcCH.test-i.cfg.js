"use strict";

var path = require("path");

var swissmedicCfg = require("./swissmedic.test-i.cfg.js");
var atcCfg = require("./atc.test-i.cfg");

module.exports = {
  "dependencies": {
    "swissmedic": {
      "json": swissmedicCfg.release.file
    },
    "atc": {
      "de": {
        "json": atcCfg.release.file
      }
    }
  },
  release: {
    "dir": path.resolve(__dirname, "../../tmp/data/release/atc"),
    "file": path.resolve(__dirname, "../../tmp/data/release/atc/atc_de-ch.json"),
    "minFile": path.resolve(__dirname, "../../tmp/data/release/atc/atc_de-ch.min.json")
  }
};