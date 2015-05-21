"use strict";

/**
 *
 * @param {{gtin: {}}} history
 * @param {{gtin: {}}} newEntries
 * @returns {[{gtin: {}}, {new: Number}]} - updated history
 */
function addNewEntriesToHistory(history, newEntries) {
  var gtin, newEntry, isGtinRegistered, newEntryCount = 0;

  for (gtin in newEntries) {
    if (newEntries.hasOwnProperty(gtin)) {
      newEntry = newEntries[gtin];
      isGtinRegistered = history[gtin];

      if (isGtinRegistered) {
        throw new Error("addNewEntriesToHistory: GTIN " + gtin + " is already registered. Can't apply GTIN.");
      }

      history[gtin] = newEntry;
      newEntryCount++;
    }
  }



  return [history, {"new": newEntryCount}];
}

module.exports = addNewEntriesToHistory;