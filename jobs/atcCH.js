"use strict";

var path = require("path");

var cfg = require("./cfg/atcCH.cfg");
var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");
var swissmedicJob = require("./swissmedic");
var swissmedicCfg = require("./cfg/swissmedic.cfg.js");
var atcJob = require("./atc");
var atcCfg = require("./cfg/atc.cfg");
var createATCCH = require("../lib/atc/createATCCH");

/**
 * @param {function(null|Error)?} done
 * @param {Log|console?} log - optional
 * @return {Promise}
 */
function atcCH(done, log) {

  log = log || defaultLog;

  log.info("ATC-CH", "Get, Load and Parse");
  log.time("ATC-CH", "Completed in");

  return new Promise(function (resolve, reject) {
    disk.ensureDir(cfg.process.dir)
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
          disk.write.json(cfg.process.atcCh, atcCH),
          disk.write.jsonMin(cfg.process.atcChMin, atcCH)
        ]);
      })
      .then(function () {
        log.timeEnd("ATC-CH", "Write Proccssed Files");
        log.timeEnd("ATC-CH", "Completed in");
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

module.exports = atcCH;