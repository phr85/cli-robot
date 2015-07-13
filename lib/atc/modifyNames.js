"use strict";

var disk = require('../common/disk');

/**
 *
 * @param {String} filename
 * @param {Object} atcDEwModifiedCodes
 * @returns {Promise}
 */
function modifyNames(filename, atcDEwModifiedCodes) {

  Object.keys(atcDEwModifiedCodes).forEach(function(atc){
    if (atc.length != 7) return;

    if (["Verschiedene", "Kombinationen", "Verschiedene Kombinationen"].indexOf(atcDEwModifiedCodes[atc].name) > -1){
      if ( !atcDEwModifiedCodes[atc.slice(0, 5)].name) return;
      atcDEwModifiedCodes[atc].name = atcDEwModifiedCodes[atc.slice(0, 5)].name + ', ' + atcDEwModifiedCodes[atc].name;
    }

    // Tiere, Insekten, Hausstaubmilben
    if (atc.indexOf("V01AA") === 0){
      if ( !atcDEwModifiedCodes["V01AA"].name ) return;
      atcDEwModifiedCodes[atc].name = atcDEwModifiedCodes["V01AA"].name + ', ' + atcDEwModifiedCodes[atc].name;
    }
  });

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
