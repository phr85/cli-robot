"use strict";

var config = require("../../lib/common/config");

module.exports = config("atc", {
  "download": {
    "url": "http://wido.de/amtl_atc-code.html",
    "linkParser": /href="(.*atc.*\.zip)"/igm,
    "file": "atc.zip",
    "zipFiles": [{name: /widode.xlsx/, dest: "atc.xlsx"}]
  },
  "manual": {
    "addFile": "add.csv",
    "capitalizeFile": "capitalize.csv",
    "changeFile": "change.csv"
  },
  "release": {
    "file": "atc.json",
    "minFile": "atc.min.json",
    "csv": "atc.csv"
  }
});