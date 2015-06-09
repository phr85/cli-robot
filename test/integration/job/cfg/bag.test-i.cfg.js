"use strict";

var path = require("path");

module.exports = {
  "download": {
    "dir": path.resolve(__dirname, "../../tmp/data/auto/bag"),
    "file": path.resolve(__dirname, "../../tmp/data/auto/bag/bag.zip"),
    "zipFiles": [{
      name: /Preparations.xml/, dest: path.resolve(__dirname, "../../tmp/data/auto/bag/bag.xml")
    }, {
      name: /Publications.xls/, dest: path.resolve(__dirname, "../../tmp/data/auto/bag/bag.xls")
    }, {
      name: /ItCodes.xml/, dest: path.resolve(__dirname, "../../tmp/data/auto/bag/it.xml")
    }]
  },
  "process": {
    "dir": path.resolve(__dirname, "../../tmp/data/release/bag"),
    "file": path.resolve(__dirname, "../../tmp/data/release/bag/bag.json"),
    "minFile": path.resolve(__dirname, "../../tmp/data/release/bag/bag.min.json"),
    "it": path.resolve(__dirname, "../../tmp/data/release/bag/it.json"),
    "itMin": path.resolve(__dirname, "../../tmp/data/release/bag/it.min.json")
  },
  "history": {
    "dir": path.resolve(__dirname, "../../tmp/data/release/bag"),
    "file": path.resolve(__dirname, "../../tmp/data/release/bag/bag.history.json"),
    "minFile": path.resolve(__dirname, "../../tmp/data/release/bag/bag.history.min.json"),
    "log": {
      "dir": path.resolve(__dirname, "../../tmp/logs/bag"),
      "deRegistered": path.resolve(__dirname, "../../tmp/logs/bag/bag.history.deRegistered.log"),
      "changes": path.resolve(__dirname, "../../tmp/logs/bag/bag.history.changes.log"),
      "new": path.resolve(__dirname, "../../tmp/logs/bag/bag.history.new.log")
    }
  }
};