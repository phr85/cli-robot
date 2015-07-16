"use strict";

var path = require("path");

var server = require("../../../fixtures/server");

module.exports = {
  "download": {
    "url": "http://localhost:" + server.port + "/amtl_atc-code.html",
    "dir": path.resolve(__dirname, "../../tmp/data/auto"),
    "name": path.resolve(__dirname, "../../tmp/data/auto/atc.zip"),
    "unzip": [{
      name: /widode.xlsx/, dest: path.resolve(__dirname, "../../tmp/data/auto/atc.xlsx")
    }]
  },
  "manual": {
    "addFile": path.resolve(__dirname, "../../../fixtures/manual/atc/add.csv"),
    "capitalizeFile": path.resolve(__dirname, "../../../fixtures/manual/atc/capitalize.csv"),
    "changeFile": path.resolve(__dirname, "../../../fixtures/manual/atc/change.csv")
  },
  "release": {
    "dir": path.resolve(__dirname, "../../tmp/data/release/atc"),
    "file": path.resolve(__dirname, "../../tmp/data/release/atc/atc.json"),
    "minFile": path.resolve(__dirname, "../../tmp/data/release/atc/atc.min.json"),
    "csv": path.resolve(__dirname, "../../tmp/data/release/atc/atc.csv")
  }
};