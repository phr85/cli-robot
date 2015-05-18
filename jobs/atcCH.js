"use strict";

var path = require("path");

var cfg = require("./cfg/atcCH.cfg");
var log = require("../lib").log;
var disk = require("../lib/common/disk");
var swissmedicJob = require("./swissmedic");
var swissmedicCfg = require("./cfg/swissmedic.cfg.js");
var createATCCH = require("../lib/atc/createATCCH");

function atcCH(atcDEwAllModifications, done) {

  log.info("ATC-CH", "Get, Load and Parse");
  log.time("ATC-CH", "Completed in");

  disk.ensureDir(cfg.process.dir)
    .then(function () {
      return disk.fileExists(cfg.dependencies.swissmedic.json);
    })
    .then(function (fileExists) {
      return new Promise(function (resolve, reject) {
        if (fileExists) {
          log.info("Dependency " + cfg.dependencies.swissmedic.json + " has been already resolved.");
          resolve();
        } else {
          log.warn("Dependency " + cfg.dependencies.swissmedic.json + " hasn't been yet resolved");
          log.warn("Trying to auto-resolve " + cfg.dependencies.swissmedic.json);
          swissmedicJob(function (err) {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        }
      });
    })
    .then(function () {
      return require(cfg.dependencies.swissmedic.json);
    })
    .then(function (swissmedicData) {
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
      done(null);
    })
    .catch(function (err) {
      log.error(err);
      done(err);
    });
}

module.exports = atcCH;