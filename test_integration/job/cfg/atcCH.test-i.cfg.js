"use strict";

var path = require("path");

var swissmedicCfg = require("./swissmedic.test-i.cfg");

module.exports = {
  "dependencies": {
    "swissmedic": {
      "json": swissmedicCfg.process.file
    }
  },
  process: {
    "dir": path.resolve(__dirname, "../../tmp/data/release/atc"),
    "atcCh": path.resolve(__dirname, "../../tmp/data/release/atc/atc_de-ch.json"),
    "atcChMin": path.resolve(__dirname, "../../tmp/data/release/atc/atc_de-ch.min.json")
  }
};