"use strict";

var path = require("path");

var swissmedicCfg = require("./swissmedic.cfg");
var atcCfg = require("./atc.cfg");

var baseDir = process.cwd();

module.exports = {
  "dependencies": {
    "swissmedic": {
      "json": swissmedicCfg.process.file
    },
    "atc": {
      "de": {
        "json": atcCfg.process.atcDe
      }
    }
  },
  process: {
    "dir": path.resolve(baseDir, "./data/release/atc"),
    "atcCh": path.resolve(baseDir, "./data/release/atc/atc_de-ch.json"),
    "atcChMin": path.resolve(baseDir, "./data/release/atc/atc_de-ch.min.json")
  }
};