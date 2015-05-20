"use strict";

function updateHistory(historyStore, tmpStore) {
  return new Promise(function () {
    var gtin, historyStoreData, tmpStoreData, dataInTmpStore;

    for (gtin in historyStore) {
      if (historyStore.hasOwnProperty(gtin)) {
        historyStoreData = historyStore[gtin];
        tmpStoreData = tmpStore[gtin];
        dataInTmpStore = !!tmpStoreData;

        if (dataInTmpStore) {
          _.merge(historyStoreData, tmpStoreData);
        }

        if (!dataInTmpStore) {
          //@TODO Which date format?
          historyStoreData.deregistered = Date.now();
        }

        delete tmpStore[gtin];
      }
    }
  });
}

module.exports = updateHistory;