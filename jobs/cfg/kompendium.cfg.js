"use strict";

var path = require("path");

var baseDir = process.cwd();

module.exports = {
  "download": {
    "url": "http://download.swissmedicinfo.ch/",
    "dir": path.resolve(baseDir, "./data/auto"),
    "zip": path.resolve(baseDir, "./data/auto/kompendium.zip"),
    "xml": path.resolve(baseDir, "./data/auto/kompendium.xml"),
    "zipFiles": [{
      name: /.xml/, dest: path.resolve(baseDir, "./data/auto/kompendium.xml")
    }]
  },
  "process": {
    "dir": path.resolve(baseDir, "./data/release/kompendium/"),
    "de": {
      "fi": path.resolve(baseDir, "./data/release/kompendium/de/fi"),
      "pi": path.resolve(baseDir, "./data/release/kompendium/de/pi")
    },
    "fr": {
      "fi": path.resolve(baseDir, "./data/release/kompendium/fr/fi"),
      "pi": path.resolve(baseDir, "./data/release/kompendium/fr/pi")
    },
    "it": {
      "fi": path.resolve(baseDir, "./data/release/kompendium/it/fi"),
      "pi": path.resolve(baseDir, "./data/release/kompendium/it/pi")
    },
    "catalog": path.resolve(baseDir, "./data/release/kompendium/catalog.json"),
    "json": path.resolve(baseDir, "./data/release/kompendium/kompendium.json"),
    "jsonMin": path.resolve(baseDir, "./data/release/kompendium/kompendium.min.json")
  }
};