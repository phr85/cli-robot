"use strict";

var path = require("path");

var baseDir = process.cwd();

module.exports = {
  "download": {
    "url": "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html",
    "linkParser": /href="([\/a-zäöü0-9?;,=.\-_&]*)".*Excel-Version Zugelassene Verpackungen/ig,
    "dir": path.resolve(baseDir, "../data/auto/"),
    "file": path.resolve(baseDir, "../data/auto/swissmedic.xlsx")
  },
  "process": {
    "dir": path.resolve(baseDir, "../data/release/swissmedic/"),
    "atcFile": path.resolve(baseDir, "../data/manual/swissmedic/atc.csv"),
    "file": path.resolve(baseDir, "../data/release/swissmedic/swissmedic.json"),
    "minFile": path.resolve(baseDir, "../data/release/swissmedic/swissmedic.min.json")
  }
};