"use strict";

var moment = require("moment");
var rewire = require("rewire");

var atc = rewire("./atc");
var atcCfg = atc.__get__("cfg");
var bag = rewire("./bag");
var bagCfg = bag.__get__("cfg");
var kompendium = rewire("./kompendium");
var kompenidumCfg = kompendium.__get__("cfg");
var swissmedic = rewire("./swissmedic");
var swissmedicCfg = swissmedic.__get__("cfg");

var defaultLog = require("../lib/index").log;
var compareFileSize = require("../lib/compare/compareFileSize");
var compareKompendiumFileSize = require("../lib/kompendium/compare/compareKompendiumFileSize");

function getDateTime() {
  return moment().format("DD.MM.YYYY HH:mm");
}

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function outdated(log) {

  log = log || defaultLog;

  return Promise.all([
    compareFileSize("ATC", atcCfg, log),
    compareFileSize("BAG", bagCfg, log),
    compareFileSize("Swissmedic", swissmedicCfg, log),
    compareKompendiumFileSize(kompenidumCfg, log)
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
        log.warn("Swissmedic", getDateTime() + " - Starting Update");
        p = p.then(function () {
          return swissmedic(log).then(function () {
            log.warn("Swissmedic", getDateTime() + " - Update Done");
          });
        });
      }

      if (refreshATC) {
        log.warn("ATC", getDateTime() + " - Starting Update");
        p = p.then(function () {
          return atc(log).then(function () {
            log.warn("ATC", getDateTime() + " - Update Done");
          });
        });
      }

      if (refreshBAG) {
        log.warn("ABG", getDateTime() + " - Starting Update");
         p = p.then(function () {
           return bag(log).then(function () {
             log.warn("BAG", getDateTime() + "- Update Done");
           });
         });
      }

      if (refreshKompendium) {
        log.warn("Kompendium", getDateTime() + " - Starting Update");
        p = p.then(function () {
          return kompendium(log).then(function () {
            log.warn("Kompendium", getDateTime() + " - Update Done");
          });
        });
      }

      return p;
    });
}

module.exports = outdated;