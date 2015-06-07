"use strict";

var defaultLog = require("../lib").log;
var history = require('../lib/history/history');

var cfg = require("./cfg/bag.cfg");
var updateHistory = require("../lib/bag/updateHistory");

var disk = require('../lib/common/disk');

/**
 * @param {function(null|Error)?} done - optional
 * @param {Log|console?} log - optional
 * @returns {Promise}
 */
function bagHistory(done, log) {
  var jobName = "BAG History";

  function onChanged(gtin, diff) {

  }

  function onDeRegistered(gtin) {

  }

  function onNew(gtin) {

  }

  history(jobName, cfg, updateHistory, done, log);
}

module.exports = bagHistory;