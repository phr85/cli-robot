"use strict";

var path = require("path");
var cwd = process.cwd();

var log = require("../lib").log;
var disk = require("../lib/common/disk");
var fetchHTML = require("../lib/common/fetchHTML");
var parseLink = require("../lib/common/parseLink");
var downloadFile = require("../lib/common/downloadFile");
var renderProgress = require("../lib/common/renderProgress");

var path = require("path");
var readXLSX = require("../lib/atc/readXLSX");
var addCodes = require("../lib/atc/addCodes");
var modifyCodes = require("../lib/atc/modifyCodes");
var modifyNames = require("../lib/atc/modifyNames");
var removeEmptyStrings = require("../lib/atc/removeEmptyStrings");
var writeATCCSV = require("../lib/atc/writeATCCSV");

var cfg = {
  "download": {
    "url": "http://wido.de/amtl_atc-code.html",
    "dir": path.resolve(cwd, "data/auto/atc"),
    "linkRegex": /href="(.*atc.*\.zip)"/igm,
    "name": path.resolve(cwd, "data/auto/atc/atc.zip"),
    "unzip": [{name: /widode.xlsx/, dest: path.resolve(cwd, "data/auto/atc/atc.xlsx")}]
  },
  "manual": {
    "addFile": path.resolve(__dirname, "../data/manual/atc/add.csv"),
    "changeFile": path.resolve(__dirname, "../data/manual/atc/change.csv"),
    "capitalizeFile": path.resolve(__dirname, "../data/manual/atc/capitalize.csv")
  },
  "release": {
    "dir": path.resolve(cwd, "data/release/atc"),
    "file": path.resolve(cwd, "data/release/atc/atc.json"),
    "minFile": path.resolve(cwd, "data/release/atc/atc.min.json"),
    "csv": path.resolve(cwd, "data/release/atc/atc.csv")
  }
};

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function atc() {

  log.info("ATC", "Get, Load and Parse");
  log.time("ATC", "Completed in");

  return new Promise(function (resolve, reject) {
    disk.ensureDir(cfg.download.dir, cfg.release.dir)
      .then(function () {
        log.debug("ATC", "Go to " + cfg.download.url);
        log.time("ATC", "Go to");
        return fetchHTML(cfg.download.url);
      })
      .then(function (result) {
        log.timeEnd("ATC", "Go to");
        log.debug("ATC", "Parse Link");
        log.time("ATC", "Parse Link");
        return parseLink(cfg.download.url, result.html, cfg.download.linkRegex);
      })
      .then(function (parsedLink) {
        log.timeEnd("ATC", "Parse Link");
        log.debug("ATC", "Start Download");
        log.time("ATC", "Download");
        return downloadFile(parsedLink, cfg.download.name, renderProgress("ATC", "Download", log));
      })
      .then(function () {
        log.timeEnd("ATC", "Download");
        log.debug("ATC", "Unzip");
        log.time("ATC", "Unzip");
        return disk.unzip(cfg.download.name, cfg.download.unzip, renderProgress("ATC", "Unzip", log));
      })
      .then(function () {
        var unzippedXLSXFile = cfg.download.unzip[0].dest;

        log.timeEnd("ATC", "Unzip");
        log.debug("ATC", "Process Files");
        log.time("ATC", "Process Files");

        return readXLSX(unzippedXLSXFile);
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
          disk.write.json(cfg.release.file, atcDEwAllModifications),
          disk.write.jsonMin(cfg.release.minFile, atcDEwAllModifications)
        ]).then(function () {
          return atcDEwAllModifications;
        });
      })
      .then(function (atcDEwAllModifications) {
        log.timeEnd("ATC", "Write Processed Files");
        log.debug("ATC", "Release CSV");
        log.time("ATC", "Release CSV");
        return writeATCCSV(cfg.release.csv, atcDEwAllModifications);
      })
      .then(function () {
        log.timeEnd("ATC", "Release CSV");
        log.debug("ATC", "Done");
        log.timeEnd("ATC", "Completed in");
        resolve();
      })
      .catch(function (err) {
        log.error(err.name, err.message, err.stack);
        reject(err);
      });
  });
}


module.exports = atc;