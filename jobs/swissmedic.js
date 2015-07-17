"use strict";

var path = require("path");
var cwd = process.cwd();

var log = require("../lib").log;
var disk = require("../lib/common/disk");
var fetchHTML = require("../lib/common/fetchHTML");
var parseLink = require("../lib/common/parseLink");
var downloadFile = require("../lib/common/downloadFile");
var renderProgress = require("../lib/common/renderProgress");

var createATCCorrection = require("../lib/swissmedic/createATCCorrection");
var correctXLSX = require("../lib/swissmedic/correctXLSX");
var readXLSX = require("../lib/swissmedic/readXLSX");

var atcCHJob = require("./atcCH.js");
var swissmedicHistory = require("./swissmedicHistory");

var cfg = {
  "download": {
    "dir": path.resolve(cwd, "data/auto/swissmedic"),
    "url": "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html",
    "linkRegex": /href="([\/a-zäöü0-9?;,=.\-_&]*)".*Excel-Version Zugelassene Verpackungen/ig,
    "name": path.resolve(cwd, "data/auto/swissmedic/swissmedic.xlsx")
  },
  "manual": {
    "atcCorrections": path.resolve(__dirname, "../data/manual/swissmedic/atc.csv")
  },
  "release": {
    "dir": path.resolve(cwd, "data/release/swissmedic"),
    "file": path.resolve(cwd, "data/release/swissmedic/swissmedic.json"),
    "minFile": path.resolve(cwd, "data/release/swissmedic/swissmedic.min.json")
  },
  "history": {
    "dir": path.resolve(cwd, "data/release/swissmedic"),
    "file": path.resolve(cwd, "logs/swissmedic/swissmedic.history.json"),
    "minFile": path.resolve(cwd, "logs/swissmedic/swissmedic.history.min.json")
  },
  "log": {
    "dir": path.resolve(cwd, "logs/swissmedic"),
    "deRegistered": path.resolve(cwd, "logs/swissmedic/swissmedic.de-registered.log"),
    "changes": path.resolve(cwd, "logs/swissmedic/swissmedic.changes.log"),
    "new": path.resolve(cwd, "logs/swissmedic/swissmedic.new.log")
  }
};

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function swissmedic() {

  log.info("Swissmedic", "Get, Load and Parse");
  log.time("Swissmedic", "Completed in");

  return new Promise(function (resolve, reject) {
    disk.ensureDir(cfg.download.dir, cfg.release.dir)
      .then(function () {
        log.time("Swissmedic", "Go to");
        log.debug("Swissmedic", "Go to " + cfg.download.url);
        return fetchHTML(cfg.download.url);
      })
      .then(function (result) {
        log.timeEnd("Swissmedic", "Go to");
        log.time("Swissmedic", "Parse Link");
        return parseLink(cfg.download.url, result.html, cfg.download.linkRegex);
      })
      .then(function (parsedLink) {
        log.timeEnd("Swissmedic", "Parse Link");
        log.debug("Swissmedic", "Parsed Link: " + parsedLink);
        log.debug("Swissmdeic", "Start Download");
        log.time("Swissmedic", "Download");
        return downloadFile(parsedLink, cfg.download.name, renderProgress("Swissmedic", "Download", log));
      })
      .then(function () {
        log.timeEnd("Swissmedic", "Download");
        log.debug("Swissmedic", "Process Files");
        log.time("Swissmedic", "Process Files");
        return createATCCorrection(cfg.manual.atcCorrections);
      })
      .then(function (atcCorrection) {
        return readXLSX(cfg.download.name, correctXLSX.setATCCorrection(atcCorrection));
      })
      .then(function (parsedXLSX) {
        log.timeEnd("Swissmedic", "Process Files");
        log.debug("Swissmedic", "Write Processed Files");
        log.time("Swissmedic", "Write Files");
        return Promise.all([
          disk.write.json(cfg.release.file, parsedXLSX),
          disk.write.jsonMin(cfg.release.minFile, parsedXLSX)
        ]);
      })
      .then(function () {
        log.timeEnd("Swissmedic", "Write Files");
        log.debug("Swissmedic", "Update History");
        log.time("Swissmedic", "Update History");
        // A build of swissmedic history is strongly coupled with fresh run of this job.
        return swissmedicHistory(log);
      })
      .then(function () {
        return atcCHJob(log);
      })
      .then(function () {
        log.debug("Swissmedic", "Done");
        log.timeEnd("Swissmedic", "Update History");
        log.timeEnd("Swissmedic", "Completed in");
        resolve();
      })
      .catch(function (err) {
        log.error(err.name, err.message, err.stack);
        reject(err);
      });
  });
}

module.exports = swissmedic;