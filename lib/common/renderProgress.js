"use strict";

var log = require("./../index").log;

/**
 *
 * @param {String} jobName
 * @param {String} taskName
 * @returns {function({percentage: Number})}
 */
function renderDownloadProgress(jobName, taskName) {
  return function (progress) {
    var status = progress.percentage.toFixed(2);

    log.doing(jobName, taskName, status);
  };
}

module.exports = renderDownloadProgress;