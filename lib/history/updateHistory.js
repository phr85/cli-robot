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
 * @param {function(string, {}, {}, {})} onChanged - optional
 * @param {function(string, {})} onDeRegistered - optional
 * @returns {[{gtin: {}}, {gtin: {}}, {updated: Number, deRegistered: Number, unChanged: Number}]}
 */
function updateHistory(historyStore, newStore, onChanged, onDeRegistered) {
  var gtin, historyData, newData, isRecorded, diff, result;
  var updated = 0, deRegistered = 0, unChanged = 0;

  for (gtin in historyStore) {
    if (historyStore.hasOwnProperty(gtin)) {
      historyData = historyStore[gtin];
      newData = newStore[gtin];
      isRecorded = !!newData;

      if (isRecorded) {
        diff = jsondiffpatch.diff(historyData, newData);

        if (diff) {
          result = onChanged(historyData.gtin, diff, historyData, newData);
          updated++;
        }

        if (!diff) {
          unChanged++;
        }
      }

      if (!isRecorded) {
        result = onDeRegistered(historyData.gtin, historyData);
        deRegistered++;
      }

      if (!result) {
        throw new Error("Can't update History. Reason: No value returned for onChanged/onDeRegistered callback.");
      }

      historyStore[gtin] = result;

      delete newStore[gtin];
    }
  }

  return [historyStore, newStore, {"updated": updated, "deRegistered": deRegistered, "unChanged": unChanged}];
}

module.exports = updateHistory;