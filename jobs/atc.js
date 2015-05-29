"use strict";

var path = require("path");

var cfg = require("./cfg/atc.cfg.js");
var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");
var fetchHTML = require("../lib/common/fetchHTML");
var parseLink = require("../lib/common/parseLink");
var downloadFile = require("../lib/common/downloadFile");
var renderProgress = require("../lib/common/renderProgress");
var readXLSX = require("../lib/atc/readXLSX");
var addCodes = require("../lib/atc/addCodes");
var modifyCodes = require("../lib/atc/modifyCodes");
var modifyNames = require("../lib/atc/modifyNames");
var removeEmptyStrings = require("../lib/atc/removeEmptyStrings");
var createATCCH = require("../lib/atc/createATCCH");
var writeATCCSV = require("../lib/atc/writeATCCSV");

var atcCHJob = require("./atcCH");

/**
 *
 * @param {function(Error|null)?} done - will be called after job has finished
 * @param {Log|console?} log - optional
 * @returns {Promise}
 */
function atc(done, log) {

  log = log || defaultLog;

  log.info("ATC", "Get, Load and Parse");
  log.time("ATC", "Completed in");

  return new Promise(function (resolve, reject) {
    disk.ensureDir(cfg.download.dir, cfg.process.dir)
      .then(function () {
        log.debug("ATC", "Go to " + cfg.download.url);
        log.time("ATC", "Go to");
        return fetchHTML(cfg.download.url);
      })
      .then(function (result) {
        log.timeEnd("ATC", "Go to");
        log.debug("ATC", "Parse Link");
        log.time("ATC", "Parse Link");
        return parseLink(cfg.download.url, result.html, cfg.download.linkParser);
      })
      .then(function (parsedLink) {
        log.timeEnd("ATC", "Parse Link");
        log.debug("ATC", "Start Download");
        log.time("ATC", "Download");
        return downloadFile(parsedLink, cfg.download.file, renderProgress("ATC", "Download"));
      })
      .then(function () {
        log.timeEnd("ATC", "Download");
        log.debug("ATC", "Unzip");
        log.time("ATC", "Unzip");
        return disk.unzip(cfg.download.file, cfg.download.zipFiles, renderProgress("ATC", "Unzip"));
      })
      .then(function () {
        log.timeEnd("ATC", "Unzip");
        log.debug("ATC", "Process Files");
        log.time("ATC", "Process Files");
        return readXLSX(cfg.download.zipFiles[0].dest);
      })
      .then(function (atcDE) {
        log.debug("ATC", "Add Codes");
        return addCodes(cfg.manual.addFile, atcDE);
      })
      .then(function (atcDEwAdditions) {
        log.debug("ATC", "Modify Codes");
        return modifyCodes(cfg.manual.changeFile, atcDEwAdditions);
      })
      .then(function (atcDEwModifiedCodes) {
        log.debug("ATC", "Modify Names");
        return modifyNames(cfg.manual.capitalizeFile, atcDEwModifiedCodes);
      })
      .then(function (atcDEwModifiedNames) {
        log.debug("ATC", "Remove empty strings");
        return removeEmptyStrings(atcDEwModifiedNames);
      })
      .then(function (atcDEwAllModifications) {
        log.timeEnd("ATC", "Process Files");
        log.debug("ATC", "Write Processed Files");
        log.time("ATC", "Write Processed Files");

        return Promise.all([
          disk.write.json(cfg.process.atcDe, atcDEwAllModifications),
          disk.write.jsonMin(cfg.process.atcDeMin, atcDEwAllModifications),
        ]).then(function () {
          return atcDEwAllModifications;
        });
      })
      .then(function (atcDEwAllModifications) {
        log.timeEnd("ATC", "Write Processed Files");
        log.debug("ATC", "Release CSV");
        log.time("ATC", "Release CSV");
        return writeATCCSV(cfg.process.csv, atcDEwAllModifications);
      })
      .then(function () {
        log.timeEnd("ATC", "Release CSV");
        log.debug("ATC", "Done");
        log.timeEnd("ATC", "Completed in");
        resolve();
        if (typeof done === "function") {
          done(null);
        }
      })
      .catch(function (err) {
        log.error(err);
        reject(err);
        if (typeof done === "function") {
          done(err);
        }
      });
  });
}


module.exports = atc;