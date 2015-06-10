"use strict";

var path = require("path");

var swissmedicCfg = require("./swissmedic.test-i.cfg.js");

console.log("swissmedicCfg.release.file", swissmedicCfg.release.file);

module.exports = {
  "dependencies": {
    "swissmedic": {
      "json": swissmedicCfg.release.file
    }
  },
  release: {
    "dir": path.resolve(__dirname, "../../tmp/data/release/atc"),
    "file": path.resolve(__dirname, "../../tmp/data/release/atc/atc_de-ch.json"),
    "minFile": path.resolve(__dirname, "../../tmp/data/release/atc/atc_de-ch.min.json")
  }
};