"use strict";

var disk = require('../disk');

/**
 *
 * @param {String} filename
 * @param {Object} parsedXLSXwModifiedCodes
 * @returns {Promise}
 */
function modifyNames(filename, parsedXLSXwModifiedCodes) {
  return disk.read.csv(filename).then(function (capitalizeCSVData) {
    capitalizeCSVData.forEach(function(row){
      if(parsedXLSXwModifiedCodes[row[0]] ) {
        parsedXLSXwModifiedCodes[row[0]].name = row[1];
      }

      return parsedXLSXwModifiedCodes;
    });
  });
}

module.exports = modifyNames;