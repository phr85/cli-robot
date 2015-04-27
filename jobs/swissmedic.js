"use strict";

var path = require("path");

var cfg = require("../config").swissmedic;
var log = require("../lib").log;
var disk = require("../lib/disk");
var fetchHTML = require("../lib/fetchHTML");
var parseLink = require("../lib/parseLink");
var downloadFile = require("../lib/downloadFile");
var readATCanXLSX = require("../lib/swissmedic/readATCandXLSX");
var mergeATCwXLSX = require("../lib/swissmedic/mergeATCwXLSX");

/**
 *
 * @param {function(Error|null)} done
 */
function swissmedic(done) {

  log.info("Swissmedic", "Get, Load and Parse");
  log.time("Swissmedic", "Completed in");

  disk
    .ensureDir(cfg.download.dir, cfg.process.dir)
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
      return readATCanXLSX(path.resolve(__dirname, "../data/manual/swissmedic", "atc.csv"), cfg.download.file); //@TODO move to config
    })
    .then(function (data) {
      var atcDATA = data[0];
      var xlsxData = data[1];

      log.timeEnd("Swissmedic", "Read Files");
      log.time("Siwssmedic", "Merge Files");

      return mergeATCwXLSX(atcDATA, xlsxData);
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
      done(null);
    })
    .catch(done);
}

moduel.export = swissmedic;