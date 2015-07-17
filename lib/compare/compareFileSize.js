"use strict";

var defaultLog = require("../index").log;
var disk = require("../common/disk");
var fetchServerFileSize = require("./fetchServerFileSize");

/**
 * Resolves with true if a refresh is needed.
 *
 * @param {String} jobName
 * @param {{download: {file: String, url: String, linkParser: ReqExp}}} cfg
 * @param {Log|console} log - optional
 * @returns {Promise}
 */
function compareFileSize(jobName, cfg, log) {

  log = log || defaultLog;

  return new Promise(function (resolve, reject) {

    log.info(jobName, "Check if " + cfg.download.name + " exists.");

    disk.fileExists(cfg.download.name)
      .then(function (fileExists) {
        if (!fileExists) {
          log.warn(jobName, cfg.download.name + " hasn't been download yet.");
          return[{size: true}, {size: false}];
        }

        log.info(jobName, "Read and fetch file stats from disk and server.");
        return Promise.all([
          disk.read.stats(cfg.download.name),
          fetchServerFileSize(cfg.download.url, cfg.download.linkParser)
        ]);
      })
      .then(function (data) {
        var downloadedFileSize = data[0].size;
        var serverFileSize = data[1].size;

        log.info(jobName, "Fetched file stats from server.");
        log.info(jobName, "Comparing disk and server stats now.");

        if (downloadedFileSize === serverFileSize) {
          log.warn(jobName, "File on disk is up-to-date");
          resolve(false);
        } else {
          log.warn(jobName, "There is a newer file on the server");
          resolve(true);
        }

      })
      .catch(function (err) {
        log.error(jobName, err);
        reject(err);
      });
  });
}

module.exports = compareFileSize;