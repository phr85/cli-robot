"use strict";

var config = require("../../lib/common/config");

module.exports = config("bag", {
  "download": {
    "url": "http://www.spezialitaetenliste.ch/",
    "linkParser": /href="(.*)".*Publikation als XML-Dateien/g,
    "file": "XMLPublications.zip",
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
    "minFile": "bag.history.min.json"
  },
  "log": {
    "deRegistered": "bag.de-registered.log",
    "changes": "bag.changes.log",
    "new": "bag.new.log"
  }
});