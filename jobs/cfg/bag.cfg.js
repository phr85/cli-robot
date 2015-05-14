"use strict";

var path = require("path");

var baseDir = process.cwd();

module.exports = {
  "download": {
    "url": "http://www.spezialitaetenliste.ch/",
    "linkParser": /href="(.*)".*Publikation als XML-Dateien/g,
    "dir": path.resolve(baseDir, "../data/auto"),
    "zip": path.resolve(baseDir, "../data/auto/XMLPublications.zip"),
    "zipFiles": [{
      name: /Preparations.xml/, dest: path.resolve(baseDir, "../data/auto/bag.xml")
    }, {
      name: /Publications.xls/, dest: path.resolve(baseDir, "../data/auto/bag.xls")
    }, {
      name: /ItCodes.xml/, dest: path.resolve(baseDir, "../data/auto/it.xml")
    }]
  },
  "process": {
    "dir": path.resolve(baseDir, "../data/release/bag"),
    "bag": path.resolve(baseDir, "../data/release/bag/bag.json"),
    "bagMin": path.resolve(baseDir, "../data/release/bag/bag.min.json"),
    "it": path.resolve(baseDir, "../data/release/bag/it.json"),
    "itMin": path.resolve(baseDir, "../data/release/bag/it.min.json")
  }
};