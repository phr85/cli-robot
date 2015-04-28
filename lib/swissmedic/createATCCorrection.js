"use strict";

/**
 * @typedef {Object} ATCData
 * @property {String} approval
 * @property {String} atcOriginal
 * @property {String} atcKorrektur
 * @property {String} name
 */

/**
 * @typedef {Object} ATCCorrection
 * @property {ATCData} id
 */

var disk = require("../../lib/disk");

/**
 *
 * @param {String} atcCSVFile - file path
 * @returns {Promise}
 */
function createATCCorrection(atcCSVFile) {
  return disk.read.csv(atcCSVFile).then(function (atcCSVData) {
    var correction = {};

    atcCSVData.forEach(function (cells) {
      correction[cells[0]] = {
        approval: cells[0],
        atcOriginal: cells[1],
        atcKorrektur: cells[2],
        name: cells[3]
      };
    });

    return correction;
  });
}

module.exports = createATCCorrection;