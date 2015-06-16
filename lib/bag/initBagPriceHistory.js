"use strict";

var moment = require("moment");

var disk = require("../common/disk");
var createDataStore = require("../history/createDataStore");

var dateFormat = "DD.MM.YYYY";

/**
 *
 * @param {{history: {price: string, priceMin: string}, release: {file: string}}} cfg
 * @returns {Promise.<T>}
 */
function initBagPriceHistory(cfg) {
  return disk.read
    .jsonFile(cfg.release.file)
    .then(function (releaseData) {
      return createDataStore(releaseData);
    })
    .then(function (releaseDataStore) {
      var gtin, product;
      var priceHistory = {};

      for (gtin in releaseDataStore) {
        if (releaseDataStore.hasOwnProperty(gtin)) {
          product = releaseDataStore[gtin];

          priceHistory[gtin] = {
            exFactory: {
              valid: [{
                price: product.exFactoryPreis,
                validFrom: product.exFactoryPreisValid,
                validTo: Infinity
              }],
              transaction: [{
                price: product.exFactoryPreis,
                validFrom: moment().format(dateFormat),
                validTo: Infinity
              }]
            },
            publikum: {
              valid: [{
                price: product.publikumsPreis,
                validFrom: product.publikumsPreisValid,
                validTo: Infinity }],
              transaction: [{
                price: product.publikumsPreis,
                validFrom: moment().format(dateFormat),
                validTo: Infinity
              }]
            }
          };
        }
      }

      return priceHistory;
    })
    .then(function (priceHistory) {
      return Promise.all([
        disk.write.json(cfg.history.price, priceHistory),
        disk.write.jsonMin(cfg.history.priceMin, priceHistory)
      ]);
    })
    .then(function (priceHistory) {
      return priceHistory[0];
    });
}

module.exports = initBagPriceHistory;