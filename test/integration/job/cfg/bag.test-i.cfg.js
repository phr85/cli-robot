"use strict";

var path = require("path");

module.exports = {
  "download": {
    "dir": path.resolve(__dirname, "../../tmp/data/auto/bag"),
    "name": path.resolve(__dirname, "../../tmp/data/auto/bag/bag.zip"),
    "unzip": [{
      name: /Preparations.xml/, dest: path.resolve(__dirname, "../../tmp/data/auto/bag/bag.xml"),
    }, {
      name: /Publications.xls/, dest: path.resolve(__dirname, "../../tmp/data/auto/bag/bag.xls"),
    }, {
      name: /ItCodes.xml/, dest: path.resolve(__dirname, "../../tmp/data/auto/bag/it.xml")
    }]
  },
  "release": {
    "dir": path.resolve(__dirname, "../../tmp/data/release/bag"),
    "file": path.resolve(__dirname, "../../tmp/data/release/bag/bag.json"),
    "minFile": path.resolve(__dirname, "../../tmp/data/release/bag/bag.min.json"),
    "it": path.resolve(__dirname, "../../tmp/data/release/bag/it.json"),
    "itMin": path.resolve(__dirname, "../../tmp/data/release/bag/it.min.json")
  },
  "history": {
    "file": path.resolve(__dirname, "../../tmp/data/release/bag/bag.history.json"),
    "minFile": path.resolve(__dirname, "../../tmp/data/release/bag/bag.history.min.json")
  },
  "log": {
    "deRegistered": path.resolve(__dirname, "../../tmp/data/log/bag/bag.history.de-registered.log"),
    "changes": path.resolve(__dirname, "../../tmp/data/log/bag/bag.history.de-registered.log"),
    "new": path.resolve(__dirname, "../../tmp/data/log/bag/bag.history.new.log")
  }
};