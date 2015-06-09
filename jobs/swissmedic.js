"use strict";

var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");
var fetchHTML = require("../lib/common/fetchHTML");
var parseLink = require("../lib/common/parseLink");
var downloadFile = require("../lib/common/downloadFile");
var renderProgress = require("../lib/common/renderProgress");

var cfg = require("./cfg/swissmedic.cfg.js");
var createATCCorrection = require("../lib/swissmedic/createATCCorrection");
var correctXLSX = require("../lib/swissmedic/correctXLSX");
var readXLSX = require("../lib/swissmedic/readXLSX");

var atcCHJob = require("./atcCH.js");
var swissmedicHistory = require("./swissmedicHistory");


/**
 *
 * @param {function(Error|null)?} done
 * @param {Log|console?} log - optional
 * @returns {Promise}
 */
function swissmedic(done, log) {

  log = log || defaultLog;

  log.info("Swissmedic", "Get, Load and Parse");
  log.time("Swissmedic", "Completed in");

  return new Promise(function (resolve, reject) {
    disk.ensureDir(cfg.download.dir, cfg.process.dir)
      .then(function () {
        log.time("Swissmedic", "Go to");
        log.debug("Swissmedic", "Go to " + cfg.download.url);
        return fetchHTML(cfg.download.url);
      })
      .then(function (result) {
        log.timeEnd("Swissmedic", "Go to");
        log.time("Swissmedic", "Parse Link");
        return parseLink(cfg.download.url, result.html, cfg.download.linkParser);
      })
      .then(function (parsedLink) {
        log.timeEnd("Swissmedic", "Parse Link");
        log.debug("Swissmedic", "Parsed Link: " + parsedLink);
        log.debug("Swissmdeic", "Start Download");
        log.time("Swissmedic", "Download");
        return downloadFile(parsedLink, cfg.download.file, renderProgress("Swissmedic", "Download", log));
      })
      .then(function () {
        log.timeEnd("Swissmedic", "Download");
        log.debug("Swissmedic", "Process Files");
        log.time("Swissmedic", "Process Files");
        return createATCCorrection(cfg.process.atcFile);
      })
      .then(function (atcCorrection) {
        return readXLSX(cfg.download.file, correctXLSX.setATCCorrection(atcCorrection));
      })
      .then(function (parsedXLSX) {
        log.timeEnd("Swissmedic", "Process Files");
        log.debug("Swissmedic", "Write Processed Files");
        log.time("Swissmedic", "Write Files");
        return Promise.all([
          disk.write.json(cfg.process.file, parsedXLSX),
          disk.write.jsonMin(cfg.process.minFile, parsedXLSX)
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
        return atcCHJob(null, log);
      })
      .then(function () {
        log.debug("Swissmedic", "Done");
        log.timeEnd("Swissmedic", "Update History");
        log.timeEnd("Swissmedic", "Completed in");
        resolve();
        if (typeof done === "function") {
          done(null);
        }
      })
      .catch(function (err) {
        log.error(err.name, err.message, err.stack);
        reject(err);
        if (typeof done === "function") {
          done(err);
        }
      });
  });
}

module.exports = swissmedic;