"use strict";

var atc = require("./atc");
var atcCfg = require("./cfg/atc.cfg.js");
var bag = require("./bag");
var bagCfg = require("./cfg/bag.cfg.js");
var kompendium = require("./kompendium");
var kompenidumCfg = require("./cfg/kompendium.cfg.js");
var swissmedic = require("./swissmedic");
var swissmedicCfg = require("./cfg/swissmedic.cfg.js");

var defaultLog = require("../lib/index").log;
var compareFileSize = require("../lib/compare/compareFileSize");
var compareKompendiumFileSize = require("../lib/kompendium/compare/compareKompendiumFileSize");

/**
 *
 * @param {Log|console?} log - optional
 * @returns {Promise}
 */
function outdated(log) {

  log = log || defaultLog;

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
      var p = new Promise(function (resolve) {
        resolve();
      });

      if (refreshSwissmedic) {
        log.debug("Swissmedic", "Starting BAG Update");
        p = p.then(swissmedic(null, log));
      }

      if (refreshATC) {
        log.debug("ATC", "Starting ATC Update");
        p = p.then(atc(null, log));
      }

      if (refreshBAG) {
        log.debug("ABG", "Starting BAG Update");
         p = p.then(bag(null, log));
      }

      if (refreshKompendium) {
        log.debug("Kompendium", "Starting Kompendium Update");
        p = p.then(kompendium(null, log));
      }

      return p;
    });
}

module.exports = outdated;