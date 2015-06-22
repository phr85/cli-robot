"use strict";

var path = require("path");

var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");

var swissmedicJob = require("./swissmedic");
var atcJob = require("./atc");
var createATCCH = require("../lib/atc/createATCCH");

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function, warn: Function}} log - optional
 * @returns {Promise}
 */
function atcCH(log) {

  log = log || defaultLog;

  log.info("ATC-CH", "Get, Load and Parse");
  log.time("ATC-CH", "Completed in");
  
  var swissmedic = path.resolve("./data/release/swissmedic/swissmedic.json");
  var atc = path.resolve("./data/release/atc/atc.json");

  return new Promise(function (resolve, reject) {
    disk.ensureDir(path.resolve("./data/release"))
      .then(function () {
        return Promise.all([
          disk.fileExists(swissmedic),
          disk.fileExists(atc)
        ]);
      })
      .then(function (fileExists) {
        var swissmedicFileExists = fileExists[0];
        var atcDEFileExists = fileExists[1];

        if (swissmedicFileExists) {
          log.info("swissmedic Dependency (" + swissmedic + ") has been already resolved.");
        }

        if (!swissmedicFileExists) {
          log.warn("swissmedic Dependency (" + swissmedic+ ") hasn't been yet resolved");
          log.warn("Trying to auto-resolve " + swissmedic);
        }

        if (atcDEFileExists) {
          log.info("atc(-DE) Dependency (" + atc + ") has been already resolved.");
        }

        if (!atcDEFileExists) {
          log.warn("atc(-DE) Dependency (" + atc + ") hasn't been yet resolved");
          log.warn("Trying to auto-resolve " + atc);
        }

        return Promise.all([
          swissmedicFileExists || swissmedicJob(null, log),
          atcDEFileExists || atcJob(null, log)
        ]);
      })
      .then(function () {
        var atcDEwAllModifications = require(atc);
        var swissmedicData = require(swissmedic);

        log.debug("ATC-CH", "Process Files");
        log.time("ATC-CH", "Process Files");

        return createATCCH(atcDEwAllModifications, swissmedicData);
      })
      .then(function (atcCH) {
        log.timeEnd("ATC-CH", "Process Files");
        log.debug("ATC-CH", "Write Processed Files");
        log.time("ATC-CH", "Write Processed Files");

        return Promise.all([
          disk.write.json("./data/release/atc/atc_de-ch.json", atcCH),
          disk.write.jsonMin("./data/release/atc/atc_de-ch.min.json", atcCH)
        ]);
      })
      .then(function () {
        log.timeEnd("ATC-CH", "Write Proccssed Files");
        log.timeEnd("ATC-CH", "Completed in");
        resolve();
      })
      .catch(function (err) {
        log.error(err);
        reject(err);
      });
  });
}

module.exports = atcCH;