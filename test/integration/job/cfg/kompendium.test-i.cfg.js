"use strict";

var path = require("path");

var server = require("../../../fixtures/server");

module.exports = {
  "download": {
    "url": "http://localhost:" + server.port + "/kompendium/",
    "dir": path.resolve(__dirname, "../../tmp/data/auto/kompendium"),
    "file": path.resolve(__dirname, "../../tmp/data/auto/kompendium/kompendium.zip"),
    "xml": path.resolve(__dirname, "../../tmp/data/auto/kompendium/kompendium.xml"),
    "zipFiles": [{
      name: /.xml/, dest: path.resolve(__dirname, "../../tmp/data/auto/kompendium/kompendium.xml")
    }]
  },
  "process": {
    "dir": path.resolve(__dirname, "../../tmp/data/release/kompendium/"),
    "de": {
      "fi": path.resolve(__dirname, "../../tmp/data/release/kompendium/de/fi"),
      "pi": path.resolve(__dirname, "../../tmp/data/release/kompendium/de/pi")
    },
    "fr": {
      "fi": path.resolve(__dirname, "../../tmp/data/release/kompendium/fr/fi"),
      "pi": path.resolve(__dirname, "../../tmp/data/release/kompendium/fr/pi")
    },
    "it": {
      "fi": path.resolve(__dirname, "../../tmp/data/release/kompendium/it/fi"),
      "pi": path.resolve(__dirname, "../../tmp/data/release/kompendium/it/pi")
    },
    "catalog": path.resolve(__dirname, "../../tmp/data/release/kompendium/catalog.json"),
    "json": path.resolve(__dirname, "../../tmp/data/release/kompendium/kompendium.json"),
    "jsonMin": path.resolve(__dirname, "../../tmp/data/release/kompendium/kompendium.min.json")
  }
};