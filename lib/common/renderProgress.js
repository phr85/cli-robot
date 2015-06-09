"use strict";

var defaultLog = require("../").log;

/**
 *
 * @param {String} jobName
 * @param {String} taskName
 * @param {Log|console?} log - optional
 * @returns {function({percentage: Number})}
 */
function renderProgress(jobName, taskName, log) {
  log = log || defaultLog;

  return function (progress) {
    var status = progress.percentage.toFixed(2);

    log.doing(jobName, taskName, status);
  };
}

module.exports = renderProgress;