"use strict";

var path = require("path");

var server = require("../../../fixtures/server");

module.exports = {
  "download": {
    "url": "http://localhost:" + server.port + "/kompendium/",
    "dir": path.resolve(__dirname, "../../tmp/data/auto/kompendium"),
    "name": path.resolve(__dirname, "../../tmp/data/auto/kompendium/kompendium.zip"),
    "unzip": [{
      name: /.xml/, dest: path.resolve(__dirname, "../../tmp/data/auto/kompendium/kompendium.xml")
    }]
  },
  "release": {
    "dir": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium"),
    "de": {
      "fi": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/de/fi"),
      "pi": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/de/pi")
    },
    "fr": {
      "fi": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/fr/fi"),
      "pi": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/fr/pi")
    },
    "it": {
      "fi": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/it/fi"),
      "pi": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/it/pi")
    },
    "catalog": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/catalog.json"),
    "file": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/kompendium.json"),
    "minFile": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/kompendium.min.json")
  }
};