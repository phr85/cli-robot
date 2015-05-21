"use strict";

var atc = require("./atc");
var atcCfg = require("./cfg/atc.cfg.js");
var bag = require("./bag");
var bagCfg = require("./cfg/bag.cfg.js");
var kompendium = require("./kompendium");
var kompenidumCfg = require("./cfg/kompendium.cfg.js");
var swissmedic = require("./swissmedic");
var swissmedicCfg = require("./cfg/swissmedic.cfg.js");

var log = require("../lib/index").log;
var compareFileSize = require("../lib/compare/compareFileSize");
var compareKompendiumFileSize = require("../lib/kompendium/compare/compareKompendiumFileSize");

/**
 *
 * @param {function (function(null|Error))} job
 * @returns {Promise}
 */
function enqueueJob(job) {
  return new Promise(function (resolve, reject) {
    job(function (err) {
      err ? reject(err) : resolve();
    });
  });
}

/**
 *
 * @returns {Promise}
 */
function outdated() {
  return Promise.all([
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
      var p;

      if (refreshSwissmedic) {
        log.debug("Swissmedic", "Starting BAG Update");
        p = enqueueJob(swissmedic);
      }

      if (refreshATC) {
        log.debug("ATC", "Starting ATC Update");
        p = p.then(enqueueJob(atc));
      }

      if (refreshBAG) {
        log.debug("ABG", "Starting BAG Update");
         p = p.then(enqueueJob(bag));
      }

      if (refreshKompendium) {
        log.debug("Kompendium", "Starting BAG Update");
        p = p.then(enqueueJob(kompendium));
      }

      return p;
    });
}

module.exports = outdated;