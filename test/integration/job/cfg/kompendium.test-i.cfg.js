"use strict";

var path = require("path");

var server = require("../../../fixtures/server");
var config = require("../../../../lib/common/config");

module.exports = {
  "download": {
    "dir": path.resolve(__dirname, "../../tmp/../../tmp/data/auto/kompendium"),
    "url": "http://download.swissmedicinfo.ch/",
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
      "pi": path.resolve(__dirname, "../../tmp/data/auto/release/kompendium/de/pi")
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

module.exports = config("kompendium", {
  "download": {
    "url": "http://localhost:" + server.port + "/kompendium/",
    "file": "kompendium.zip",
    "zipFiles": [{ name: /.xml/, dest: "kompendium.xml" }]
  },
  "release": {
    "de": {
      "fi": "./de/fi",
      "pi": "./de/pi"
    },
    "fr": {
      "fi": "./fr/fi",
      "pi": "./fr/pi"
    },
    "it": {
      "fi": "./it/fi",
      "pi": "./it/pi"
    },
    "catalog": "catalog.json",
    "file": "kompendium.json",
    "minFile": "kompendium.min.json"
  }
}, path.resolve(__dirname, "../../tmp/"));