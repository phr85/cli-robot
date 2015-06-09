"use strict";

var merge = require("merge");
var moment = require("moment");

var history = require("../lib/history/history");

var cfg = require("../jobs/cfg/swissmedic.cfg");

/**
 * This job is strongly coupled with basic swissmedic job as it makes only sense to run it,
 * after fresh data were fetched.
 *
 * @param {Log|console?} log - optional
 * @returns {Promise}
 */
function swissmedicHistory(log) {
  var jobName = "Swissmedic History";

  function onChanged() {
    // default behaviour will do
  }

  return history(jobName, cfg, onChanged, log);
}

module.exports = swissmedicHistory;