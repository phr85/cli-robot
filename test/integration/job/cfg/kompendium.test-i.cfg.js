"use strict";

var path = require("path");

var server = require("../../../fixtures/server");
var config = require("../../../../lib/common/config");

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