"use strict";

var disk = require("../disk");
var swissmedicJob = require("../../jobs/swissmedic");
var swissmedicCfg = swissmedicJob.cfg;

/**
 *
 * @returns {Promise}
 */
function getSwissmedicData() {
  var swissmedicData;

  return disk.fileExists(swissmedicCfg.process.file)
    .then(function (fileExists) {
      return new Promise(function (resolve, reject) {
        if (fileExists) {
          swissmedicData = require(swissmedicCfg.process.file);
          resolve(swissmedicData);
        } else {
          swissmedicJob(function (err) {
            if (err) {
              return reject(err);
            }

            swissmedicData = require(swissmedicCfg.process.file);
            resolve(swissmedicData);
          });
        }
      });
    });
}

module.exports = getSwissmedicData;