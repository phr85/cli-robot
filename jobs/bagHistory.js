"use strict";

var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");
var history = require("../lib/history/history");
var createDataStore = require("../lib/history/createDataStore");
var createDataCollection = require("../lib/history/createDataCollection");

var cfg = require("./cfg/bag.cfg");
var initBagPriceHistory = require("../lib/bag/initBagPriceHistory");
var updateBagHistoryData = require("../lib/bag/updateBagPriceHistoryData");

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function bagHistory(log) {
  var jobName = "BAG History";

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
          updateBagHistoryData(newData, priceHistoryStore[historyData.gtin]);
        }
      }

      return history(jobName, cfg, onChanged, log)
        .then(function () {
          return priceHistoryStore;
        });
    })
    .then(function (priceHistoryStore) {
      return Promise.all([
        disk.write.json(cfg.history.price, priceHistoryStore),
        disk.write.json(cfg.history.priceMin, priceHistoryStore)
      ]);
    });
}

module.exports = bagHistory;