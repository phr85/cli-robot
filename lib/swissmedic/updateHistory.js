"use strict";

var merge = require("merge");
var moment = require("moment");

var hasChanged = require("deep-eql");

/**
 * @param {{}} obj
 * @returns {{}}
 */
function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 *
 * @param {{gtin: {}}} historyStore
 * @param {{gtin: {}}} newStore - Deletes processed data. Only real new entries will be left.
 * @param {function({}, {})} onChanged - optional
 * @param {function({})} onDeRegistered - optional
 * @returns {[{gtin: {}}, {gtin: {}}, {updated: Number, deRegistered: Number, unChanged: Number}]}
 */
function updateHistory(historyStore, newStore, onChanged, onDeRegistered) {
  var gtin, historyStoreData, historyStoreDataCopy, newStoreData, newStoreDataCopy, isInNewStore;
  var updated = 0, deRegistered = 0, unChanged = 0;

  for (gtin in historyStore) {
    if (historyStore.hasOwnProperty(gtin)) {
      historyStoreData = historyStore[gtin];
      newStoreData = newStore[gtin];
      isInNewStore = !!newStoreData;

      if (isInNewStore) {
        // @TODO for some reason this seems to be not always reliable. Find out the problem.
        if (hasChanged(historyStoreData, newStoreData)) {
          if (onChanged) {
            historyStoreDataCopy = copy(historyStoreData);
            newStoreDataCopy = copy(newStoreData);
            onChanged(historyStoreDataCopy, newStoreDataCopy);
          }
          merge.recursive(historyStoreData, newStoreData);
          updated++;
        } else {
          unChanged++;
        }
      }

      if (!isInNewStore) {
        if (onDeRegistered) {
          historyStoreDataCopy = copy(historyStoreData);
          onDeRegistered(historyStoreDataCopy);
        }
        historyStoreData.deregistered = moment().format("dd.mm.YYYY");
        deRegistered++;
      }

      delete newStore[gtin];
    }
  }

  return [historyStore, newStore, {"updated": updated, "deRegistered": deRegistered, "unChanged": unChanged}];
}

module.exports = updateHistory;