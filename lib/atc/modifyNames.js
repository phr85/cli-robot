"use strict";

var disk = require('../disk');

/**
 *
 * @param {String} filename
 * @param {Object} atcDEwModifiedCodes
 * @returns {Promise}
 */
function modifyNames(filename, atcDEwModifiedCodes) {
  return disk.read.csv(filename).then(function (capitalizeCSVData) {
    capitalizeCSVData.forEach(function(row){
      if(atcDEwModifiedCodes[row[0]] ) {
        atcDEwModifiedCodes[row[0]].name = row[1];
      }
    });

    return atcDEwModifiedCodes;
  });
}

module.exports = modifyNames;