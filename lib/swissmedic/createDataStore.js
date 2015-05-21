"use strict";

/**
 *
 * @param {[{gtin: String}]} dataArray
 * @returns {{}}
 */
function createDataStore(dataArray) {
  var tmp, store = {};
  var i, dataLength = dataArray.length;

  for (i = 0; i < dataLength; i++) {
    tmp = dataArray[i];
    store[tmp.gtin] = tmp;
  }

  return store;
}

module.exports = createDataStore;