"use strict";

var jsondiffpatch = require("jsondiffpatch");
var merge = require("merge");
var moment = require("moment");

/**
 *
 * @param {{gtin: {}}} historyStore
 * @param {{gtin: {}}} newStore - Deletes processed data. Only real new entries will be left.
 * @param {function(string, {}, {}, {})} onChanged - optional
 * @param {function(string, {})} onDeRegistered - optional
 * @returns {[{gtin: {}}, {gtin: {}}, {updated: Number, deRegistered: Number, unChanged: Number}]}
 */
function updateHistory(historyStore, newStore, onChanged, onDeRegistered) {
  var gtin, historyData, newData, isRecorded, diff, diffCount;
  var updated = 0, deRegistered = 0, unChanged = 0;

  for (gtin in historyStore) {
    if (historyStore.hasOwnProperty(gtin)) {
      historyData = historyStore[gtin];
      newData = newStore[gtin];
      isRecorded = !!newData;
      diffCount = 0;

      if (isRecorded) {
        diff = jsondiffpatch.diff(historyData, newData);

        if (diff) {
          delete diff.deregistered;
          delete diff.publikumsPreisHistory;
          delete diff.exFactoryHistory;

          if (Object.keys(diff).length) {
            onChanged(gtin, diff, historyData, newData);
            historyStore[gtin] = merge.recursive(false, historyData, newData);
            updated++;
          }
        }

        unChanged++;
      }

      if (!isRecorded) {
        onDeRegistered(gtin, historyData);
        historyData.deregistered = moment().format("DD.MM.YYYY");
        deRegistered++;
      }

      delete newStore[gtin];
    }
  }

  return [historyStore, newStore, {"updated": updated, "deRegistered": deRegistered, "unChanged": unChanged}];
}

module.exports = updateHistory;