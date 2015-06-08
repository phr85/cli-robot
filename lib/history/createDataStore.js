"use strict";

var jsondiffpatch = require("jsondiffpatch");
var shasum = require('shasum');

/**
 *
 * @param {[{gtin: String}]} dataArray
 * @param {log|console} log
 * @returns {{}}
 */
function createDataStore(dataArray, log) {
  var gtin, tmp, diff, store = {};
  var i, dataLength = dataArray.length;

  log = log || console;

  for (i = 0; i < dataLength; i++) {
    tmp = dataArray[i];
    gtin = tmp.gtin;

    if (store[gtin]) {
      diff = jsondiffpatch.diff(store[tmp.gtin], tmp);

      if (diff) {
        gtin = gtin + "_" + shasum(JSON.stringify(diff));
        log.warn(
          "createDataStore: GTIN " + tmp.gtin + " is already taken. " +
          "Difference in data found: creating synthetic GTIN - " + gtin + "."
        );
      }

      if (!diff) {
        log.warn(
          "createDataStore: GTIN " + tmp.gtin + " is already taken. " +
          "No difference in da found, re-assigning data."
        );
      }

    }

    store[gtin] = tmp;
  }

  return store;
}

module.exports = createDataStore;