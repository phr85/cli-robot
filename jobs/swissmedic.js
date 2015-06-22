"use strict";

var path = require("path");

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

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function swissmedic() {

  log.info("Swissmedic", "Get, Load and Parse");
  log.time("Swissmedic", "Completed in");
  
  var url = "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html";
  var file = "swissmedic.xlsx";
  var linkParser = /href="([\/a-zäöü0-9?;,=.\-_&]*)".*Excel-Version Zugelassene Verpackungen/ig;
  

  return new Promise(function (resolve, reject) {
    disk.ensureDir(path.resolve("./data/auto"), path.resolve("./data/release"))
      .then(function () {
        log.time("Swissmedic", "Go to");
        log.debug("Swissmedic", "Go to " + url);
        return fetchHTML(url);
      })
      .then(function (result) {
        log.timeEnd("Swissmedic", "Go to");
        log.time("Swissmedic", "Parse Link");
        return parseLink(url, result.html, linkParser);
      })
      .then(function (parsedLink) {
        log.timeEnd("Swissmedic", "Parse Link");
        log.debug("Swissmedic", "Parsed Link: " + parsedLink);
        log.debug("Swissmdeic", "Start Download");
        log.time("Swissmedic", "Download");
        return downloadFile(parsedLink, file, renderProgress("Swissmedic", "Download", log));
      })
      .then(function () {
        log.timeEnd("Swissmedic", "Download");
        log.debug("Swissmedic", "Process Files");
        log.time("Swissmedic", "Process Files");
        return createATCCorrection(path.resolve(__dirname, "../data/manual/swissmedic/atc.csv"));
      })
      .then(function (atcCorrection) {
        return readXLSX(file, correctXLSX.setATCCorrection(atcCorrection));
      })
      .then(function (parsedXLSX) {
        log.timeEnd("Swissmedic", "Process Files");
        log.debug("Swissmedic", "Write Processed Files");
        log.time("Swissmedic", "Write Files");
        return Promise.all([
          disk.write.json(path.resolve("./data/release/swissmedic/swissmedic.json"), parsedXLSX),
          disk.write.jsonMin(path.resolve("./data/release/swissmedic/swissmedic.min.json"), parsedXLSX)
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