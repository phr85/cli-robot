"use strict";

/**
 *
 * @param dataStore
 * @returns {Array}
 */
function createDataCollection(dataStore) {
  var dataCollection = Object.keys(dataStore).map(function (gtin) {
    if (gtin.length > 13) {
      // @see lib/history/createDataStore
      gtin = gtin.split("_")[0];
    }

    return dataStore[gtin];
  });

  return dataCollection;
}

module.exports = createDataCollection;