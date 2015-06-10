"use strict";

var config = require("../../../../lib/common/config");

var path = require("path");

module.exports = config("bag", {
  "download": {
    "file": "bag.zip",
    "zipFiles": [{
      name: /Preparations.xml/, dest: "bag.xml"
    }, {
      name: /Publications.xls/, dest: "bag.xls"
    }, {
      name: /ItCodes.xml/, dest: "it.xml"
    }]
  },
  "release": {
    "file": "bag.json",
    "minFile": "bag.min.json",
    "it": "it.json",
    "itMin": "it.min.json"
  },
  "history": {
    "file": "bag.history.json",
    "minFile": "bag.history.min.json",
  },
  "log": {
    "deRegistered": "bag.history.de-registered.log",
    "changes": "bag.history.changes.log",
    "new": "bag.history.new.log"
  }
}, path.resolve(__dirname, "../../tmp/"));