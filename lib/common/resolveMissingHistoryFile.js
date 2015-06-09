"use strict";

var defaultLog = require("../").log;
var disk = require('./disk');

function resolveMissingHistoryFile(jobName, cfg, log) {

  log = log || defaultLog;

  /**
   * @param {Error} err
   */
  return function(err) {
    if (err.code === "MODULE_NOT_FOUND" && err.message.search(cfg.history.file) > -1) {

      log.warn(jobName, "History-File Not Found");
      log.warn(jobName, "Using " + cfg.process.file + " As Start Of History");

      return disk.read
        .jsonFile(cfg.process.file)
        .then(function (newData) {
          log.time(jobName, "Write History File");

          return Promise.all([
            disk.write.json(cfg.history.file, newData),
            disk.write.jsonMin(cfg.history.minFile, newData)
          ]);
        })
        .then(function () {
          log.timeEnd(jobName, "Write History File");
          log.debug(jobName, "Done");
          log.timeEnd(jobName, "Completed in");
        });
    }

    throw err;
  };
}

module.exports = resolveMissingHistoryFile;