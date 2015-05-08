"use strict";

var path = require("path");

var log = require("../lib").log;
var disk = require("../lib/disk");
var fetchHTML = require("../lib/fetchHTML");
var parseLink = require("../lib/parseLink");
var downloadFile = require("../lib/downloadFile");
var renderProgress = require("../lib/renderProgress");
var createATCCorrection = require("../lib/swissmedic/createATCCorrection");
var correctXLSX = require("../lib/swissmedic/correctXLSX");
var readXLSX = require("../lib/swissmedic/readXLSX");

var cfg = {
  "download": {
    "url": "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html",
    "linkParser": /href="([\/a-zäöü0-9?;,=.\-_&]*)".*Excel-Version Zugelassene Verpackungen/ig,
    "dir": path.resolve(__dirname, "../data/auto/"),
    "file": path.resolve(__dirname, "../data/auto/swissmedic.xlsx")
  },
  "process": {
    "dir": path.resolve(__dirname, "../data/release/swissmedic/"),
    "atcFile": path.resolve(__dirname, "../data/manual/swissmedic/atc.csv"),
    "file": path.resolve(__dirname, "../data/release/swissmedic/swissmedic.json"),
    "minFile": path.resolve(__dirname, "../data/release/swissmedic/swissmedic.min.json")
  }
};

/**
 *
 * @param {function(Error|null)} done
 */
function swissmedic(done) {

  log.info("Swissmedic", "Get, Load and Parse");
  log.time("Swissmedic", "Completed in");

  disk.ensureDir(cfg.download.dir, cfg.process.dir)
    .then(function () {
      log.time("Swissmedic", "Get HTML");
      return fetchHTML(cfg.download.url);
    })
    .then(function (result) {
      log.timeEnd("Swissmedic", "Get HTML");
      log.time("Swissmedic", "Parse Link");
      return parseLink(cfg.download.url, result.html, cfg.download.linkParser);
    })
    .then(function (parsedLink) {
      log.timeEnd("Swissmedic", "Parse Link");
      log.time("Swissmedic", "Download");
      return downloadFile(parsedLink, cfg.download.file, renderProgress("Swissmedic", "Download"));
    })
    //@TODO resolve dependencies, in this case atc.csv must be present
    .then(function () {
      log.timeEnd("Swissmedic", "Download");
      log.time("Swissmedic", "Read Files");
      return createATCCorrection(cfg.process.atcFile);
    })
    .then(function (atcCorrection) {
      return readXLSX(cfg.download.file, correctXLSX.setATCCorrection(atcCorrection));
    })
    .then(function (parsedXLSX) {
      log.timeEnd("Swissmedic", "Read Files");
      log.time("Swissmedic", "Write Files");
      return Promise.all([
        disk.write.json(cfg.process.file, parsedXLSX),
        disk.write.jsonMin(cfg.process.minFile, parsedXLSX)
      ]);
    })
    .then(function () {
      log.time("Swissmedic", "Write Files");
      log.timeEnd("Swissmedic", "Completed in");
      done(null);
    })
    .catch(function (err) {
      log.error(err);
      done(err);
    });
}

swissmedic.cfg = cfg;

module.exports = swissmedic;