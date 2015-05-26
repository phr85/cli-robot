"use strict";

var atc = require("../jobs/atc");
var atcCfg = require("../jobs/cfg/atc.cfg");
var bag = require("../jobs/bag");
var bagCfg = require("../jobs/cfg/bag.cfg");
var kompendium = require("../jobs/kompendium");
var kompenidumCfg = require("../jobs/cfg/kompendium.cfg");
var swissmedic = require("../jobs/swissmedic");
var swissmedicCfg = require("../jobs/cfg/swissmedic.cfg");

var log = require("../lib").log;
var compareFileSize = require("../lib/compare/compareFileSize");
var compareKompendiumFileSize = require("../lib/kompendium/compare/compareKompendiumFileSize");

function enqueueJob(job) {
  return new Promise(function (resolve, reject) {
    job(function (err) {
      err ? reject(err) : resolve();
    });
  });
}

Promise.all([
  compareFileSize("ATC", atcCfg),
  compareFileSize("BAG", bagCfg),
  compareFileSize("Swissmedic", swissmedicCfg),
  compareKompendiumFileSize(kompenidumCfg)
])
  .then(function (result) {
    var refreshATC = result[0];
    var refreshBAG = result[1];
    var refreshSwissmedic = result[2];
    var refreshKompendium = result[3];
    var jobQueue = [];

    if (refreshATC) {
      log.debug("ATC", "Starting ATC Update");
      jobQueue.push(enqueueJob(atc));
    }

    if (refreshBAG) {
      log.debug("ABG", "Starting BAG Update");
      jobQueue.push(enqueueJob(bag));
    }

    if (refreshSwissmedic) {
      log.debug("Swissmedic", "Starting BAG Update");
      jobQueue.push(enqueueJob(swissmedic));
    }

    if (refreshKompendium) {
      log.debug("Kompendium", "Starting BAG Update");
      jobQueue.push(enqueueJob(kompendium));
    }

    return Promise.all(jobQueue);
  })
  .then(function () {
    log.info("Out-dated check is finished");
    process.exit(0);
  }).catch(function (err) {
    log.error(err);
    process.exit(1); //not ok
  });