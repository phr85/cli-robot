"use strict";

var config = require("../../lib/common/config");

var swissmedicCfg = require("./swissmedic.cfg");
var atcCfg = require("./atc.cfg");

module.exports = config("atc", {
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
  "release": {
    "file": "atc_de-ch.json",
    "minFile": "atc_de-ch.min.json"
  }
});