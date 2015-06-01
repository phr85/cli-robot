"use strict";

var jsondiffpatch = require("jsondiffpatch");
var merge = require("merge");
var moment = require("moment");

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
  var gtin, historyStoreData, newStoreData, isRecorded, diff;
  var updated = 0, deRegistered = 0, unChanged = 0;

  for (gtin in historyStore) {
    if (historyStore.hasOwnProperty(gtin)) {
      historyStoreData = historyStore[gtin];
      newStoreData = newStore[gtin];
      isRecorded = !!newStoreData;

      if (isRecorded) {
        diff = jsondiffpatch.diff(historyStoreData, newStoreData);

        if (diff) {
          if (onChanged) {
            onChanged(historyStoreData.gtin, diff);
          }
          historyStore[gtin] = merge.recursive(historyStoreData, newStoreData);
          updated++;
        }

        if (!diff) {
          unChanged++;
        }
      }

      if (!isRecorded) {
        if (onDeRegistered) {
          onDeRegistered(historyStoreData.gtin);
        }
        historyStoreData.deregistered = moment().format("DD.MM.YYYY");
        deRegistered++;
      }

      delete newStore[gtin];
    }
  }

  return [historyStore, newStore, {"updated": updated, "deRegistered": deRegistered, "unChanged": unChanged}];
}

module.exports = updateHistory;