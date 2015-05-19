"use strict";

var log = require("../index").log;
var disk = require("../common/disk");
var doRequest = require("../common/doRequest");
var fetchServerFileSize = require("./fetchServerFileSize");

/**
 *
 * @param {String} jobName
 * @param {{download: {file: String, url: String, linkParser: ReqExp}}} cfg
 * @returns {Promise}
 */
function compareFileSize(jobName, cfg) {
  return new Promise(function (resolve, reject) {
    log.info(jobName, "Check if " + cfg.download.file + " exists.");

    disk.fileExists(cfg.download.file)
      .then(function (fileExists) {
        if (!fileExists) {
          log.info(jobName, cfg.download.file + " hasn't been download yet.");
          return[{size: true}, {size: false}];
        }

        log.info(jobName, "Read and fetch file stats from disk and server.");
        return Promise.all([
          disk.read.stats(cfg.download.file),
          fetchServerFileSize(cfg.download.url, cfg.download.linkParser)
        ]);
      })
      .then(function (data) {
        var downloadedFileSize = data[0].size;
        var serverFileSize = data[1].size;

        log.info(jobName, "Fetched file stats from server.");
        log.info(jobName, "Comparing disk and server stats now.");

        if (downloadedFileSize === serverFileSize) {
          log.debug(jobName, "File on disk is up-to-date");
        } else {
          log.warn(jobName, "There is a newer file on the server");
        }

        resolve();
      })
      .catch(function (err) {
        if (err instanceof doRequest.DoRequestError) {
          log.error(jobName, "Unable to fetch file stats from server. Reason:");
        }

        log.error(jobName, err);
        reject(err);
      });

  });
}

module.exports = compareFileSize;