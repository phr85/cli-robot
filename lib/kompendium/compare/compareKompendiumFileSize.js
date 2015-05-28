"use strict";

var log = require("../../index").log;
var disk = require("../../common/disk");
var doRequest = require("../../common/doRequest");
var fetchKompendiumServerFileSize = require("./fetchKompendiumServerFileSize");

/**
 * Resolves with true if a refresh is needed.
 *
 * @param {{download: {file: String}}} cfg
 * @returns {Promise}
 */
function compareKompendiumFileSize(cfg) {
  return new Promise(function (resolve, reject) {
    log.info("Kompendium", "Check if " + cfg.download.file + " exists.");

    disk.fileExists(cfg.download.file)
      .then(function (fileExists) {
        if (!fileExists) {
          log.info("Kompendium", cfg.download.file + " hasn't been download yet.");
          return[{size: true}, {size: false}];
        }

        log.info("Kompendium", "Read and fetch file stats from disk and server.");
        return Promise.all([
          disk.read.stats(cfg.download.file),
          fetchKompendiumServerFileSize(cfg.download.url)
        ]);
      })
      .then(function (data) {
        var downloadedFileSize = data[0].size;
        var serverFileSize = data[1].size;

        log.info("Kompendium", "Fetched file stats from server.");
        log.info("Kompendium", "Comparing disk and server stats now.");

        if (downloadedFileSize === serverFileSize) {
          log.debug("Kompendium", "File on disk is up-to-date");
          resolve(false);
        } else {
          log.warn("Kompendium", "There is a newer file on the server");
          resolve(true);
        }

      })
      .catch(function (err) {
        if (err instanceof doRequest.DoRequestError) {
          log.error("Kompendium", "Unable to fetch file stats from server. Reason:");
        }

        log.error("Kompendium", err);
        reject(err);
      });
  });
};

module.exports = compareKompendiumFileSize;