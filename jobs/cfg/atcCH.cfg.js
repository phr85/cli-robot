"use strict";

var config = require("../../lib/common/config");

module.exports = config("atc", {
  "dependencies": {
    "swissmedic": {
      "json": "../data/release/swissmedic/swissmedic.json"
    },
    "atc": {
      "de": {
        "json": "../data/release/atc/atc.json"
      }
    }
  },
  "release": {
    "file": "atc_de-ch.json",
    "minFile": "atc_de-ch.min.json"
  }
});