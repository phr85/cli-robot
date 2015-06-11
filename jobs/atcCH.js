"use strict";

var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");

var cfg = require("./cfg/atcCH.cfg");
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

  return new Promise(function (resolve, reject) {
    disk.ensureDir(cfg.release.dir)
      .then(function () {
        return Promise.all([
          disk.fileExists(cfg.dependencies.swissmedic.json),
          disk.fileExists(cfg.dependencies.atc.de.json)
        ]);
      })
      .then(function (fileExists) {
        var swissmedicFileExists = fileExists[0];
        var atcDEFileExists = fileExists[1];

        if (swissmedicFileExists) {
          log.info("swissmedic Dependency (" + cfg.dependencies.swissmedic.json + ") has been already resolved.");
        }

        if (!swissmedicFileExists) {
          log.warn("swissmedic Dependency (" + cfg.dependencies.swissmedic.json + ") hasn't been yet resolved");
          log.warn("Trying to auto-resolve " + cfg.dependencies.swissmedic.json);
        }

        if (atcDEFileExists) {
          log.info("atc(-DE) Dependency (" + cfg.dependencies.atc.de.json + ") has been already resolved.");
        }

        if (!atcDEFileExists) {
          log.warn("atc(-DE) Dependency (" + cfg.dependencies.atc.de.json + ") hasn't been yet resolved");
          log.warn("Trying to auto-resolve " + cfg.dependencies.atc.de.json);
        }

        return Promise.all([
          swissmedicFileExists || swissmedicJob(null, log),
          atcDEFileExists || atcJob(null, log)
        ]);
      })
      .then(function () {
        var atcDEwAllModifications = require(cfg.dependencies.atc.de.json);
        var swissmedicData = require(cfg.dependencies.swissmedic.json);

        log.debug("ATC-CH", "Process Files");
        log.time("ATC-CH", "Process Files");

        return createATCCH(atcDEwAllModifications, swissmedicData);
      })
      .then(function (atcCH) {
        log.timeEnd("ATC-CH", "Process Files");
        log.debug("ATC-CH", "Write Processed Files");
        log.time("ATC-CH", "Write Processed Files");

        return Promise.all([
          disk.write.json(cfg.release.file, atcCH),
          disk.write.jsonMin(cfg.release.minFile, atcCH)
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