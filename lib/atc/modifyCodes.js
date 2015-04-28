"use strict";

var disk = require("../disk");

/**
 *
 * @param {String} filename
 * @param {Object} parsedXLSXwAddedCodes
 * @returns {Promise}
 */
function modifyCodes(filename, parsedXLSXwAddedCodes) {
  return disk.read.csv(filename).then(function (modifyCSVData) {
    modifyCSVData.forEach( function(row){
      if(
        parsedXLSXwAddedCodes[row[0]] &&
        parsedXLSXwAddedCodes[row[0]].name == row[1] &&
        parsedXLSXwAddedCodes[row[0]].ddd == row[2]
      ) {

        delete parsedXLSXwAddedCodes[row[0]];

        if(!parsedXLSXwAddedCodes[row[3]]) {
          parsedXLSXwAddedCodes[row[3]] = { name: row[5], ddd: row[5] };
        }
      }
    });

    return parsedXLSXwAddedCodes;
  });
}

module.exports = modifyCodes;