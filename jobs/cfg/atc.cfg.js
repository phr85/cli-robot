"use strict";

var path = require("path");

var baseDir = process.cwd();

module.exports = {
  "download": {
    "url": "http://wido.de/amtl_atc-code.html",
    "linkParser": /href="(.*atc.*\.zip)"/igm,
    "dir": path.resolve(baseDir, "./data/auto/"),
    "file": path.resolve(baseDir, "./data/auto/atc.zip"),
    "zipFiles": [{name: /widode.xlsx/, dest: path.resolve(baseDir, "./data/auto/atc.xlsx")}]
  },
  "manual": {
    "addFile": path.resolve(baseDir, "./data/manual/atc", "add.csv"),
    "capitalizeFile": path.resolve(baseDir, "./data/manual/atc", "capitalize.csv"),
    "changeFile": path.resolve(baseDir, "./data/manual/atc", "change.csv")
  },
  "process": {
    "dir": path.resolve(baseDir, "./data/release/atc"),
    "atcDe": path.resolve(baseDir, "./data/release/atc/atc.json"),
    "atcDeMin": path.resolve(baseDir, "./data/release/atc/atc.min.json"),
    "csv": path.resolve(baseDir, "./data/release/atc/atc.csv")
  }
};