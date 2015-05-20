"use strict";

/**
 *
 * @param {[]} history
 * @param {[]} newEntries
 * @returns {Promise}
 */
function addNewEntriesToHistory(history, newEntries) {
  return new Promise(function (resolve, reject) {
    var gtin, newEntry, isGtinRegistered;

    for (gtin in newEntries) {
      if (newEntries.hasOwnProperty(gtin)) {
        newEntry = newEntries[gtin];
        isGtinRegistered = history[gtin];

        if (isGtinRegistered) {
          return reject(new Error("addNewEntriesToHistory: GTIN " + gtin + " is already registered. Can't apply GTIN."));
        }

        history[gtin] = newEntry;
      }
    }

    resolve(history);
  });
}

module.exports = addNewEntriesToHistory;