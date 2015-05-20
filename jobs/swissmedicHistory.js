"use strict";

var _ = require("lodash");

var cfg = require("../jobs/cfg/swissmedic.cfg");

var log = require("../lib").log;
var disk = require("../lib/common/disk");

var createDataStore = require("../lib/swissmedic/createDataStore");
var updateHistory = require("../lib/swissmedic/updateHistory");
var addNewEntriesToHistory = require("../lib/swissmedic/addNewEntriesToHistory");

/**
 *
 * @returns {Promise}
 */
function swissmedicHistory() {
  return disk.ensureDir(cfg.history.dir)
    .then(function () {
      return Promise.all([
        disk.read.jsonFile(cfg.history.file),
        disk.read.jsonFile(cfg.process.file)
      ]);
    })
    .then(function (data) {
      return Promise.all([
        createDataStore(data[0]),
        createDataStore(data[1])
      ]);
    })
    .then(function (dataStores) {
      var historyStore = dataStores[0];
      var tmpStore = dataStores[1];

      return Promise.all[(
        historyStore,
        updateHistory(historyStore, tmpStore)
      )];
    })
    .then(function (historyStore, newEntries) {
      return addNewEntriesToHistory(historyStore, newEntries);
    })
    .then(function (history) {
      return disk.write.json(cfg.history.file, history);
    })
    .catch(function (err) {
      return disk
        .fileExists(cfg.history.file)
        .then(function (historyFileExists) {
          if (!historyFileExists) {
            return disk.read.jsonFile(cfg.process.file)
              .then(function (newHistory) {
                return disk.write.json(cfg.history.file, newHistory);
              });
          }

          throw err;
        });
    });
}

module.exports = swissmedicHistory;