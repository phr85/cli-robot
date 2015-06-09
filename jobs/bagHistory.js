"use strict";

var merge = require("merge");
var moment = require("moment");

var defaultLog = require("../lib").log;
var history = require('../lib/history/history');

var cfg = require("./cfg/bag.cfg");

/**
 * @param {Log|console?} log - optional
 * @returns {Promise}
 */
function bagHistory(log) {
  var jobName = "BAG History";

  log = log || defaultLog;

  function onChanged(diff, historyData) {
    var changeDateTime = moment().format("DD.MM.YYYY HH:mm");
    var exFactoryRecord = { dateTime: changeDateTime };
    var publikumsPreisRecord = { dateTime: changeDateTime };

    if (!historyData.exFactoryHistory) {
      historyData.exFactoryHistory = [];
    }

    if (!historyData.publikumsPreisHistory) {
      historyData.publikumsPreisHistory = [];
    }



    if (diff.exFactoryPreis) {
      exFactoryRecord.exFactoryPreis = diff.exFactoryPreis;
    }

    if (diff.exFactoryPreisValid) {
      exFactoryRecord.exFactoryPreisValid = diff.exFactoryPreisValid;
    }

    if (diff.exFactoryPreis || diff.exFactoryPreisValid) {
      historyData.exFactoryHistory.push(exFactoryRecord);
    }



    if (diff.publikumsPreis) {
      publikumsPreisRecord.publikumsPreis = diff.publikumsPreis;
    }

    if (diff.publikumsPreisValid) {
      publikumsPreisRecord.publikumsPreisValid = diff.publikumsPreisValid;
    }

    if (diff.publikumsPreis || diff.publikumsPreisValid) {
      historyData.publikumsPreisHistory.push(publikumsPreisRecord);
    }
  }

  return history(jobName, cfg, onChanged, log);
}

module.exports = bagHistory;