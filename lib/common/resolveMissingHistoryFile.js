"use strict";

var disk = require('./disk');

function resolveMissingHistoryFile(jobName, historyFile, processFile, processMinFile, done, log) {
  /**
   * @param {Error} err
   */
  return function(err) {
    return disk
      .fileExists(historyFile)
      .then(function (historyFileExists) {
        if (!historyFileExists) {
          log.warn(jobName, "History-File Not Found");
          log.warn(jobName, "Using " + processFile + " As Start Of History");

          return disk.read
            .jsonFile(processFile)
            .then(function (newData) {
              log.time(jobName, "Write History File");

              return Promise.all([
                disk.write.json(historyFile, newData),
                disk.write.jsonMin(processMinFile, newData)
              ]);
            })
            .then(function () {
              log.timeEnd(jobName, "Write History File");
              log.debug(jobName, "Done");
              log.timeEnd(jobName, "Completed in");

              if (typeof done === "function") {
                done(null);
              }
            })
            .catch(function (err) {
              if (typeof done === "function") {
                done(err);
              }
            });
        }

        if (typeof done === "function") {
          done(err);
        } else {
          throw err;
        }
      });
  };
}

module.exports = resolveMissingHistoryFile;