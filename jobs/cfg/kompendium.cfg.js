"use strict";

var config = require("../../lib/common/config");

module.exports = config("kompendium", {
  "download": {
    "url": "http://download.swissmedicinfo.ch/",
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
      "fi": "./pit/fi",
      "pi": "./it/pi"
    },
    "catalog": "catalog.json",
    "file": "kompendium.json",
    "minFile": "kompendium.min.json"
  }
});