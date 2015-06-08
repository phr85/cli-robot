"use strict";

var merge = require("merge");
var moment = require("moment");

var history = require("../lib/history/history");

var cfg = require("../jobs/cfg/swissmedic.cfg");

/**
 * This job is strongly coupled with basic swissmedic job as it makes only sense to run it,
 * after fresh data were fetched.
 *
 * @param {function(null|Error)?} done - optional
 * @param {Log|console?} log - optional
 * @returns {Promise}
 */
function swissmedicHistory(done, log) {
  var jobName = "Swissmedic History";

  function onChanged(gtin, diff, historyData, newData) {
    log.warn(jobName, "Change detected: (GTIN)" + gtin + ")", diff);
    return merge.recursive(historyData, newData);
  }

  function onDeRegistered(gtin, historyData) {
    log.warn(jobName, "DE-Registered: (GTIN)" + gtin);
    historyData.deregistered = moment().format("DD.M.YYYY");
    return historyData;
  }

  function onNew(gtin) {
    log.warn(jobName, "New: (GTIN)" + gtin);
  }

  return history(jobName, cfg, onChanged, onDeRegistered, onNew, done, log);
}

module.exports = swissmedicHistory;