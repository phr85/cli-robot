"use strict";

var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");
var history = require("../lib/history/history");

var cfg = require("./cfg/bag.cfg");
var initBagPriceHistory = require("../lib/bag/initBagPriceHistory");
var updateBagHistoryData = require("../lib/bag/updateBagPriceHistoryData");

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function bagHistory(log) {
  var jobName = "BAG History";
  var priceChangeDetected = false;

  log = log || defaultLog;

  return disk.fileExists(cfg.history.price)
    .then(function (fileExists) {
      if (fileExists) {
        return disk.read.jsonFile(cfg.history.price);
      } else {
        return initBagPriceHistory(cfg);
      }
    })
    .then(function (priceHistoryStore) {
      function onChanged(diff, historyData, newData) {
        if (diff.exFactoryPreis || diff.publikumsPreis) {
          priceChangeDetected = true;
          updateBagHistoryData(newData, priceHistoryStore[historyData.gtin]);
        }
      }

      log.time(jobName, "Updating Price History");
      log.debug(jobName, "Updating Price History");

      return history(jobName, cfg, onChanged, log)
        .then(function () {
          log.timeEnd(jobName, "Updating Price History");
          log.debug(jobName, "Updating Price History Done");
          return priceHistoryStore;
        });
    })
    .then(function (priceHistoryStore) {
      if (priceChangeDetected) {
        log.time(jobName, "Writing Price History Files");
        log.debug(jobName, "Writing Price History Files");

        return Promise.all([
          disk.write.json(cfg.history.price, priceHistoryStore),
          disk.write.json(cfg.history.priceMin, priceHistoryStore)
        ]).then(function () {
          log.timeEnd(jobName, "Writing Price History Files");
        });
      }
    });
}

module.exports = bagHistory;