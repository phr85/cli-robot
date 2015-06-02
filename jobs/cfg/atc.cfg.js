"use strict";

var path = require("path");

var baseDir = process.cwd();

module.exports = {
  "download": {
    "url": "http://wido.de/amtl_atc-code.html",
    "linkParser": /href="(.*atc.*\.zip)"/igm,
    "dir": path.resolve(baseDir, "./data/auto/atc/"),
    "file": path.resolve(baseDir, "./data/auto/atc/atc.zip"),
    "zipFiles": [{name: /widode.xlsx/, dest: path.resolve(baseDir, "./data/auto/atc/atc.xlsx")}]
  },
  "manual": {
    "addFile": path.resolve(__dirname, "../../data/manual/atc", "add.csv"),
    "capitalizeFile": path.resolve(__dirname, "../../data/manual/atc", "capitalize.csv"),
    "changeFile": path.resolve(__dirname, "../../data/manual/atc", "change.csv")
  },
  "process": {
    "dir": path.resolve(baseDir, "./data/release/atc"),
    "atcDe": path.resolve(baseDir, "./data/release/atc/atc.json"),
    "atcDeMin": path.resolve(baseDir, "./data/release/atc/atc.min.json"),
    "csv": path.resolve(baseDir, "./data/release/atc/atc.csv")
  }
};