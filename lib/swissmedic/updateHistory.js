"use strict";

var merge = require("merge");

var objDiff = require("../common/objDiff");

/**
 *
 * @param {{gtin: {}}} historyStore
 * @param {{gtin: {}}} newStore
 * @returns {[{gtin: {}}, {gtin: {}}, {updated: Number, deRegistered: Number, unChanged: Number}]}
 */
function updateHistory(historyStore, newStore) {
  var gtin, historyStoreData, newStoreData, dataInNewStore, diff;
  var updated = 0, deRegistered = 0, unChanged = 0;

  for (gtin in historyStore) {
    if (historyStore.hasOwnProperty(gtin)) {
      historyStoreData = historyStore[gtin];
      newStoreData = newStore[gtin];
      dataInNewStore = !!newStoreData;

      if (dataInNewStore) {
        diff = objDiff(historyStoreData, newStoreData);
        if (Object.keys(diff).length) {
          merge.recursive(historyStoreData, diff);
          updated++;
        } else {
          unChanged++;
        }
      }

      if (!dataInNewStore) {
        historyStoreData.deregistered = Date.now();
        deRegistered++;
      }

      delete newStore[gtin];
    }
  }

  return [historyStore, newStore, {"updated": updated, "deRegistered": deRegistered, "unChanged": unChanged}];
}

module.exports = updateHistory;