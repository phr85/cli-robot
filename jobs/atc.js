"use strict";

var path = require("path");
var swissmedicCfg = require("./swissmedic").cfg;

var baseDir = process.cwd();
var cfg = {
  "download": {
    "url": "http://wido.de/amtl_atc-code.html",
    "linkParser": /href="(.*atc.*\.zip)"/igm,
    "dir": path.resolve(baseDir, "../data/auto/"),
    "file": path.resolve(baseDir, "../data/auto/atc.zip"),
    "zipFiles": [{name: /widode.xlsx/, dest: path.resolve(baseDir, "../data/auto/atc.xlsx")}]
  },
  "manual": {
    "addFile": path.resolve(baseDir, "../data/manual/atc", "add.csv"),
    "capitalizeFile": path.resolve(baseDir, "../data/manual/atc", "capitalize.csv"),
    "changeFile": path.resolve(baseDir, "../data/manual/atc", "change.csv")
  },
  "process": {
    "dir": path.resolve(baseDir, "../data/release/atc"),
    "atcDe": path.resolve(baseDir, "../data/release/atc/atc.json"),
    "atcDeMin": path.resolve(baseDir, "../data/release/atc/atc.min.json"),
    "atcCh": path.resolve(baseDir, "../data/release/atc/atc_de-ch.json"),
    "atcChMin": path.resolve(baseDir, "../data/release/atc/atc_de-ch.min.json"),
    "csv": path.resolve(baseDir, "../data/release/atc/atc.csv")
  }
};

var log = require("../lib").log;
var disk = require("../lib/disk");
var fetchHTML = require("../lib/fetchHTML");
var parseLink = require("../lib/parseLink");
var downloadFile = require("../lib/downloadFile");
var renderProgress = require("../lib/renderProgress");
var readXLSX = require("../lib/atc/readXLSX");
var addCodes = require("../lib/atc/addCodes");
var modifyCodes = require("../lib/atc/modifyCodes");
var modifyNames = require("../lib/atc/modifyNames");
var removeEmptyStrings = require("../lib/atc/removeEmptyStrings");
var createATCCH = require("../lib/atc/createATCCH");
var writeCSV = require("../lib/atc/writeCSV");

/**
 *
 * @param {function(Error|null)} done - will be called after job has finished
 */
function atc(done) {
  var swissmedicData;

  log.info("ATC", "Get, Load and Parse");
  log.time("ATC", "Completed in");

  disk.ensureDir(cfg.download.dir, cfg.process.dir)
    // @TODO swissmedic depends on release/atc.csv while atc. depends on swissmedic ???
    // @TODO This is pretty ugly and should be fixed with dependency resolution
    .then(function () {
      return new Promise(function (resolve, reject) {
        try {
          resolve(swissmedicData = require(swissmedicCfg.process.file));
        } catch (err) {
          if (err && err.code === "MODULE_NOT_FOUND") {
            log.error("ATC", "Please load swissmedic first");
            return reject(new Error("ATC", "Please load swissmedic first"));
          }
          reject(err);
        }
      });
    })
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
      log.debug("ATC", "Create CH file");
      return Promise.all([
        atcDEwAllModifications,
        createATCCH(atcDEwAllModifications, swissmedicData)
      ]);
    })
    .then(function (atc) {
      var atcDE = atc[0];
      var atcCH = atc[1];

      log.timeEnd("ATC", "Process Files");
      log.debug("ATC", "Write Processed Files");
      log.time("ATC", "Write Processed Files");

      return Promise.all([
        disk.write.json(cfg.process.atcDe, atcDE),
        disk.write.jsonMin(cfg.process.atcDeMin, atcDE),
        disk.write.json(cfg.process.atcCh, atcCH),
        disk.write.jsonMin(cfg.process.atcChMin, atcCH)
      ]).then(function () {
        return atcDE;
      });
    })
    .then(function (atcDE) {
      log.time("ATC", "Write Processed Files");
      log.debug("ATC", "Release CSV");
      log.time("ATC", "Release CSV");
      return writeCSV(cfg.process.csv, atcDE);
    })
    .then(function () {
      log.timeEnd("ATC", "Release CSV");
      log.debug("ATC", "Done");
      log.time("ATC", "Completed in");
      done();
    })
    .catch(function (err) {
      log.error(err);
      done(err);
    });
}

atc.cfg = cfg;

module.exports = atc;