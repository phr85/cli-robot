"use strict";

/**
 *
 * @param {[]} dataArray
 * @returns {Promise}
 */
function createDataStore(dataArray) {
  return new Promise(function (resolve) {
    var tmp, store = {};
    var i, dataLength = dataArray.length;

    for (i = 0; i < dataLength; i++) {
      tmp = dataArray[i];
      store[tmp.gtin] = tmp;
    }

    resolve(store);
  });
}

module.exports = createDataStore;