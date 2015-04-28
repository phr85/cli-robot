"use strict";

var disk = require("../disk");

/**
 *
 * @param {String} filename
 * @param {Object} parsedXLSX
 * @returns {Promise}
 */
function addCodes(filename, parsedXLSX) {
  return disk.read.csv(filename).then(function (addCSVData) {
    addCSVData.forEach( function(row){
      if(!parsedXLSX[row[0]] ) {
        parsedXLSX[row[0]] = { name: row[1], ddd: row[2] };
      }
    });

    return parsedXLSX;
  });
}

module.exports = addCodes;