"use strict";

var path = require("path");

var server = require("../../../fixtures/server");

module.exports = {
  "download": {
    "url": "http://localhost:" + server.port + "/amtl_atc-code.html",
    "dir": path.resolve(__dirname, "../../tmp/data/auto"),
    "file": path.resolve(__dirname, "../../tmp/data/auto/atc.zip"),
    "zipFiles": [{
      name: /widode.xlsx/, dest: path.resolve(__dirname, "../../tmp/data/auto/atc.xlsx")
    }]
  },
  "manual": {
    "addFile": path.resolve(__dirname, "../../../fixtures/manual/atc/add.csv"),
    "capitalizeFile": path.resolve(__dirname, "../../../fixtures/manual/atc/capitalize.csv"),
    "changeFile": path.resolve(__dirname, "../../../fixtures/manual/atc/change.csv")
  },
  "process": {
    "dir": path.resolve(__dirname, "../../tmp/data/release/atc"),
    "atcDe": path.resolve(__dirname, "../../tmp/data/release/atc/atc.json"),
    "atcDeMin": path.resolve(__dirname, "../../tmp/data/release/atc/atc.min.json"),
    "atcCh": path.resolve(__dirname, "../../tmp/data/release/atc/atc_de-ch.json"),
    "atcChMin": path.resolve(__dirname, "../../tmp/data/release/atc/atc_de-ch.min.json"),
    "csv": path.resolve(__dirname, "../../tmp/data/release/atc/atc.csv")
  }
};