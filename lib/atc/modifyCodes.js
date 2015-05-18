"use strict";

var disk = require("../common/disk");

/**
 *
 * @param {String} filename
 * @param {Object} atcDEwAdditions
 * @returns {Promise}
 */
function modifyCodes(filename, atcDEwAdditions) {
  return disk.read.csv(filename).then(function (modifyCSVData) {
    modifyCSVData.forEach( function(row){
      if(
        atcDEwAdditions[row[0]] &&
        atcDEwAdditions[row[0]].name == row[1] &&
        atcDEwAdditions[row[0]].ddd == row[2]
      ) {

        delete atcDEwAdditions[row[0]];

        if(!atcDEwAdditions[row[3]]) {
          atcDEwAdditions[row[3]] = { name: row[5], ddd: row[5] };
        }
      }
    });

    return atcDEwAdditions;
  });
}

module.exports = modifyCodes;