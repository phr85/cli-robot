"use strict";

var streamifier = require("streamifier");
var moment = require("moment");

var defaultLog = require("../").log;
var disk = require('../common/disk');
var createDataStore = require('./createDataStore');
var resolveMissingHistoryFile = require("./resolveMissingHistoryFile");
var updateHistory = require("./updateHistory");
var addNewEntriesToHistory = require('./addNewEntriesToHistory');

/**
 *
 * @param {String} jobName
 * @param {{}} cfg
 * @param {function({}, {}, {})} onChanged
 * @param {Log|console?} log - optional
 * @returns {Promise}
 */
function history(jobName, cfg, onChanged, log) {
  var historyDataBackup;

  log = log || defaultLog;

  log.time(jobName, "Completed in");

  return disk.ensureDir(cfg.history.dir, cfg.history.log.dir)
    .then(function () {
      log.time(jobName, "Read Input Files");

      return Promise.all([
        disk.read.jsonFile(cfg.history.file),
        disk.read.jsonFile(cfg.process.file)
      ]);
    })
    .then(function (data) {
      var historyData = data[0];
      var newData = data[1];

      historyDataBackup = data[0];

      log.timeEnd(jobName, "Read Input Files");
      log.time(jobName, "Create Data Stores");

      return [
        createDataStore(historyData),
        createDataStore(newData)
      ];
    })
    .then(function (dataStores) {
      var historyStore = dataStores[0];
      var newStore = dataStores[1];
      var changes = [];
      var deRegistrations = [];
      var processedStores, changesLog, deRegistrationsLog;

      function _onChanged(gtin, diff, historyData, newData) {
        log.warn(jobName, "Change detected: (GTIN)" + gtin + ")", diff);
        changes.push(moment().format("DD.MM.YYYY") + "|GTIN:" + gtin + "|" + JSON.stringify(diff));
        onChanged(diff, historyData, newData);
      }

      function _onDeRegistered(gtin) {
        log.warn(jobName, "DE-Registered: (GTIN)" + gtin);
        deRegistrations.push(moment().format("DD.MM.YYYY") + "|GTIN:" + gtin);
      }

      log.timeEnd(jobName, "Create Data Stores");
      log.time(jobName, "Updated History");

      processedStores = updateHistory(historyStore, newStore, _onChanged, _onDeRegistered);
      changesLog = streamifier.createReadStream(changes.join("\n") + "\n");
      deRegistrationsLog = streamifier.createReadStream(deRegistrations.join("\n") + "\n");

      return Promise.all([
        processedStores,
        disk.write.stream(cfg.history.log.changes, changesLog, { flags: "a" }),
        disk.write.stream(cfg.history.log.deRegistered, deRegistrationsLog, { flags: "a" })
      ]);
    })
    .then(function (result) {
      var processedStores = result[0];
      var historyStore = processedStores[0];
      var newEntryStore = processedStores[1];
      var metrics = processedStores[2];
      var newEntries = [];
      var newEntriesLog;

      function _onNew(gtin) {
        log.warn(jobName, "New: (GTIN)" + gtin);
        newEntries.push(moment().format("DD.MM.YYYY") + "|GTIN:" + gtin);
      }

      log.timeEnd(jobName, "Updated History");
      log.warn(jobName, "Updated Entries: " + metrics.updated);
      log.warn(jobName, "De-registered Entries: " +  metrics.deRegistered);
      log.info(jobName, "Unchanged Entries: " + metrics.unChanged);
      log.time(jobName, "Add New Entries");

      processedStores = addNewEntriesToHistory(historyStore, newEntryStore, _onNew);
      newEntriesLog = streamifier.createReadStream(newEntries.join("\n") + "\n");

      return Promise.all([
        processedStores,
        disk.write.stream(cfg.history.log.new, newEntriesLog, { flags: "a"})
      ]);
    })
    .then(function (result) {
      var historyData = result[0];
      var history = historyData[0];
      var metrics = historyData[1];
      var historyCollection;

      log.timeEnd(jobName, "Add New Entries");
      log.warn(jobName, "New Entries: " +  metrics.new);
      log.time(jobName, "Create Data Collection");

      historyCollection = Object.keys(history).map(function (gtin) {
        return history[gtin];
      });

      return historyCollection;
    })
    .then(function  (history) {
      log.timeEnd(jobName, "Create Entry Collection");
      log.time(jobName, "Write History File");

      return Promise.all([
        disk.write.json(cfg.history.file, history),
        disk.write.jsonMin(cfg.history.minFile, history)
      ]);
    })
    .then(function () {
      log.timeEnd(jobName, "Write History File");
      log.debug(jobName, "Done");
      log.timeEnd(jobName, "Completed in");
    })
    .catch(resolveMissingHistoryFile(jobName, cfg, log));
}

module.exports = history;