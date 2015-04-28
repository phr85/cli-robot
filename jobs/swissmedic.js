"use strict";

var path = require("path");

var cfg = require("../config").swissmedic;
var log = require("../lib").log;
var disk = require("../lib/disk");
var fetchHTML = require("../lib/fetchHTML");
var parseLink = require("../lib/parseLink");
var downloadFile = require("../lib/downloadFile");
var readATCandXLSX = require("../lib/swissmedic/readATCandXLSX");
var correctXLSX = require("../lib/swissmedic/correctXLSX");

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
    .then(function (html) {
      log.timeEnd("Swissmedic", "Get HTML");
      log.time("Swissmedic", "Parse Link");
      return parseLink(cfg.download.url, html, /href="([\/a-zäöü0-9?;,=.\-_&]*)".*Excel-Version Zugelassene Verpackungen/i);
    })
    .then(function (parsedLink) {
      log.timeEnd("Swissmedic", "Parse Link");
      log.time("Siwssmedic", "Download");
      return downloadFile(parsedLink, cfg.download.file);
    })
    //@TODO resolve dependencies, in this case atc.csv must be present
    .then(function () {
      log.timeEnd("Swissmedic", "Download");
      log.time("Swissmedic", "Read Files")
      return readATCandXLSX(path.resolve(__dirname, "../data/manual/swissmedic", "atc.csv"), cfg.download.file); //@TODO move to config
    })
    .then(function (data) {
      var atcCorrection = data[0];
      var xlsxData = data[1];

      log.timeEnd("Swissmedic", "Read Files");
      log.time("Siwssmedic", "Merge Files");

      return correctXLSX(atcCorrection, xlsxData);
    })
    .then(function (data) {
      log.timeEnd("Swissmedic", "Merge Files");
      log.time("Swissmedic", "Write Files");
      return disk.write.json(cfg.process.file, data);
    })
    .then(function (data) {
      return disk.write.jsonMin(cfg.process.minFile, data);
    })
    .then(function () {
      log.time("Swissmedic", "Write Files");
      log.timeEnd("Swissmedic", "Completed in");
      done(null);
    })
    .catch(done);
}

module.exports = swissmedic;