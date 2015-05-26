"use strict";

var disk = require("../common/disk");

/**
 *
 * @param {String} filename
 * @param {Object} atcDE
 * @returns {Promise}
 */
function addCodes(filename, atcDE) {
  return disk.read.csv(filename).then(function (addCSVData) {
    addCSVData.forEach( function(row){
      if(!atcDE[row[0]] ) {
        atcDE[row[0]] = { name: row[1], ddd: row[2] };
      }
    });

    return atcDE;
  });
}

module.exports = addCodes;