"use strict";

var jsondiffpatch = require("jsondiffpatch");

var cfg = require("../jobs/cfg/swissmedic.cfg");

var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");

var createDataStore = require("../lib/swissmedic/createDataStore");
var updateHistory = require("../lib/swissmedic/updateHistory");
var addNewEntriesToHistory = require("../lib/swissmedic/addNewEntriesToHistory");

/**
 * This job is strongly coupled with basic swissmedic job as it makes only sesne to run it,
 * after fresh data were fetched.
 *
 * @param {function(null|Error)?} done - optional
 * @param {Log|console?} log - optional
 * @returns {Promise}
 */
function swissmedicHistory(done, log) {

  log = log || defaultLog;

  log.time("Swissmedic History", "Completed in");

  return disk.ensureDir(cfg.history.dir)
    .then(function () {
      log.time("Swissmedic History", "Read Input Files");

      return Promise.all([
        disk.read.jsonFile(cfg.history.file),
        disk.read.jsonFile(cfg.process.file)
      ]);
    })
    .then(function (data) {
      var historyData = data[0];
      var newData = data[1];

      log.timeEnd("Swissmedic History", "Read Input Files");
      log.time("Swissmedic History", "Create Data Stores");

      return [
        createDataStore(historyData),
        createDataStore(newData)
      ];
    })

    .then(function (dataStores) {
      var historyStore = dataStores[0];
      var newStore = dataStores[1];

      function onChanged(historyStoreData, newStoreData) {
        var diff = jsondiffpatch.diff(historyStoreData, newStoreData);

        // @TODO Remove workaround(if-statement) after TODO in updateHistory.js is solved.
        if (diff) {
          log.warn(
            "Swissmedic History",
            "Changes (GTIN: " + historyStoreData.gtin +")",
            jsondiffpatch.diff(historyStoreData, newStoreData)
          );
        }
      }

      function onDeRegistered(historyStoreData) {
        log.warn("Swissmedic History", "DE-Registered (GTIN: " + historyStoreData.gtin + ")", historyStoreData);
      }

      log.timeEnd("Swissmedic History", "Create Data Stores");
      log.time("Swissmedic History", "Updated History");

      return updateHistory(historyStore, newStore, onChanged, onDeRegistered);
    })
    .then(function (processedStores) {
      var historyStore = processedStores[0];
      var newEntryStore = processedStores[1];
      var metrics = processedStores[2];

      log.timeEnd("Swissmedic History", "Updated History");
      log.warn("Swissmedic History", "Updated Entries: " + metrics.updated);
      log.warn("Swissmedic History", "De-registered Entries:" +  metrics.deRegistered);
      log.info("Swissmedic History", "Unchanged Entries:" + metrics.unChanged);
      log.time("Swissmedic History", "Add New Entries");

      return addNewEntriesToHistory(historyStore, newEntryStore);
    })
    .then(function (historyData) {
      var historyCollection;
      var history = historyData[0];
      var metrics = historyData[1];

      log.timeEnd("Swissmedic History", "Add New Entries");
      log.warn("Swissmedic History", "New Entries: " +  metrics.new);
      log.time("Swissmedic History", "Create Entry Collection");

      historyCollection = Object.keys(history).map(function (gtin) {
        return history[gtin];
      });

      return historyCollection;
    })
    .then(function  (history) {
      log.timeEnd("Swissmedic History", "Create Entry Collection");
      log.time("Swissmedic History", "Write History File");

      return Promise.all([
        disk.write.json(cfg.history.file, history),
        disk.write.jsonMin(cfg.history.minFile, history)
      ]);
    })
    .then(function () {
      log.timeEnd("Swissmedic History", "Write History File");
      log.debug("Swissmedic History", "Done");
      log.timeEnd("Swissmedic History", "Completed in");

      if (typeof done === "function") {
        done(null);
      }
    })
    .catch(function (err) {
      return disk
        .fileExists(cfg.history.file)
        .then(function (historyFileExists) {
          if (!historyFileExists) {
            log.warn("Swissmedic History", "History-File Not Found");
            log.warn("Swissmedic History", "Using " + cfg.process.file + " As Start Of History");

            return disk.read
              .jsonFile(cfg.process.file)
              .then(function (newData) {
                log.time("Swissmedic History", "Write History File");

                return Promise.all([
                  disk.write.json(cfg.history.file, newData),
                  disk.write.jsonMin(cfg.history.minFile, newData)
                ]);
              })
              .then(function () {
                log.timeEnd("Swissmedic History", "Write History File");
                log.debug("Swissmedic History", "Done");
                log.timeEnd("Swissmedic History", "Completed in");

                if (typeof done === "function") {
                  done(null);
                }
              })
              .catch(function (err) {
                if (typeof done === "function") {
                  done(err);
                }
              });
          }

          if (typeof done === "function") {
            done(err);
          } else {
            throw err;
          }
        });
    });
}

module.exports = swissmedicHistory;