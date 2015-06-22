"use strict";

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

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function atc() {

  log.info("ATC", "Get, Load and Parse");
  log.time("ATC", "Completed in");
  
  var url = "http://wido.de/amtl_atc-code.html";
  var file = "atc.zip";
  var zipFiles = [{name: /widode.xlsx/, dest: "atc.xlsx"}];

  return new Promise(function (resolve, reject) {
    disk.ensureDir(path.resolve("./data/auto"), path.resolve("./data/release"))
      .then(function () {
        log.debug("ATC", "Go to " + url);
        log.time("ATC", "Go to");
        return fetchHTML(url);
      })
      .then(function (result) {
        log.timeEnd("ATC", "Go to");
        log.debug("ATC", "Parse Link");
        log.time("ATC", "Parse Link");
        return parseLink(url, result.html, /href="(.*atc.*\.zip)"/igm);
      })
      .then(function (parsedLink) {
        log.timeEnd("ATC", "Parse Link");
        log.debug("ATC", "Start Download");
        log.time("ATC", "Download");
        return downloadFile(parsedLink, file, renderProgress("ATC", "Download", log));
      })
      .then(function () {
        log.timeEnd("ATC", "Download");
        log.debug("ATC", "Unzip");
        log.time("ATC", "Unzip");
        return disk.unzip(file, zipFiles, renderProgress("ATC", "Unzip", log));
      })
      .then(function () {
        log.timeEnd("ATC", "Unzip");
        log.debug("ATC", "Process Files");
        log.time("ATC", "Process Files");
        return readXLSX(zipFiles[0].dest);
      })
      .then(function (atcDE) {
        log.debug("ATC", "Add Codes");
        var fs = require("fs");
        var path = require("path");

        return addCodes(path.resolve(__dirname,"../data/manual/atc/add.csv"), atcDE);
      })
      .then(function (atcDEwAdditions) {
        log.debug("ATC", "Modify Codes");
        return modifyCodes(path.resolve(__dirname,"../data/manual/atc/change.csv"), atcDEwAdditions);
      })
      .then(function (atcDEwModifiedCodes) {
        log.debug("ATC", "Modify Names");
        return modifyNames(path.resolve(__dirname,"../data/manual/atc/capitalize.csv"), atcDEwModifiedCodes);
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
          disk.write.json(path.resolve("./data/release/atc/atc.json"), atcDEwAllModifications),
          disk.write.jsonMin(path.resolve("./data/release/atc/atc.min.json"), atcDEwAllModifications)
        ]).then(function () {
          return atcDEwAllModifications;
        });
      })
      .then(function (atcDEwAllModifications) {
        log.timeEnd("ATC", "Write Processed Files");
        log.debug("ATC", "Release CSV");
        log.time("ATC", "Release CSV");
        return writeATCCSV(path.resolve("./data/release/atc/atc.csv"), atcDEwAllModifications);
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