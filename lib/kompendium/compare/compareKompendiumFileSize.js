"use strict";

var defaultLog = require("../../index").log;
var disk = require("../../common/disk");
var fetchKompendiumServerFileSize = require("./fetchKompendiumServerFileSize");

/**
 * Resolves with true if a refresh is needed.
 *
 * @param {{download: {file: String}}} cfg
 * @param {Log|console} log - optional
 * @returns {Promise}
 */
function compareKompendiumFileSize(cfg, log) {

  log = log || defaultLog;

  return new Promise(function (resolve, reject) {
    log.info("Kompendium", "Check if " + cfg.download.name + " exists.");

    disk.fileExists(cfg.download.name)
      .then(function (fileExists) {
        if (!fileExists) {
          log.warn("Kompendium", cfg.download.name + " hasn't been download yet.");
          return[{size: true}, {size: false}];
        }

        log.info("Kompendium", "Read and fetch file stats from disk and server.");
        return Promise.all([
          disk.read.stats(cfg.download.name),
          fetchKompendiumServerFileSize(cfg.download.url)
        ]);
      })
      .then(function (data) {
        var downloadedFileSize = data[0].size;
        var serverFileSize = data[1].size;

        log.info("Kompendium", "Fetched file stats from server.");
        log.info("Kompendium", "Comparing disk and server stats now.");

        if (downloadedFileSize === serverFileSize) {
          log.warn("Kompendium", "File on disk is up-to-date");
          resolve(false);
        } else {
          log.warn("Kompendium", "There is a newer file on the server");
          resolve(true);
        }

      })
      .catch(function (err) {
        log.error("Kompendium", err.message, err.stack);
        reject(err);
      });
  });
}
module.exports = compareKompendiumFileSize;