"use strict";

var config = require("../../lib/common/config");

module.exports = config("swissmedic", {
  "download": {
    "url": "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html",
    "linkParser": /href="([\/a-zäöü0-9?;,=.\-_&]*)".*Excel-Version Zugelassene Verpackungen/ig,
    "file": "swissmedic.xlsx"
  },
  "manual": {
    "atcCorrections": "atc.csv"
  },
  "release": {
    "file": "swissmedic.json",
    "minFile": "swissmedic.min.json"
  },
  "history": {
    "file": "swissmedic.history.json",
    "minFile": "swissmedic.history.min.json"
  },
  "log": {
    "deRegistered": "swissmedic.de-registered.log",
    "changes": "swissmedic.changes.log",
    "new": "swissmedic.new.log"
  }
});