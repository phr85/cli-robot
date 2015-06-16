"use strict";

var moment = require("moment");

var df = "DD.MM.YYYY";

/**
 *
 * @param {object} newData
 * @param {string} priceKey
 * @param {string} validFromKey
 * @returns {{price: string, validFrom: string, validTo: Number}}
 */
function getNewValid(newData, priceKey, validFromKey) {
  return {
    price: newData[priceKey],
    validFrom: newData[validFromKey],
    validTo: Infinity
  };
}

/**
 *
 * @param {object} newData
 * @param {string} priceKey
 * @returns {{price: string, validFrom: string, validTo: Number}}
 */
function getNewTransaction(newData, priceKey) {
  return {
    price: newData[priceKey],
    validFrom: moment().format(df),
    validTo: Infinity
  };
}

/**
 *
 * @param {string?} date - optional
 * @returns {string}
 */
function yesterday(date) {
  var m = !!date ? moment(date, df) : moment();

  return m.subtract(1, "days").format(df);
}

/**
 *
 * @param {object} newData
 * @param {object} priceHistoryData
 * @returns {{exFactory: {valid: object, transaction: object}, publikum: {valid: object, transaction: object}}
 */
function updateBagPriceHistoryData(newData, priceHistoryData) {
  var latestExFactoryValid = priceHistoryData.exFactory.valid[0];
  var latestExFactoryTransaction = priceHistoryData.exFactory.transaction[0];
  var latestPublikumValid = priceHistoryData.publikum.valid[0];
  var latestPublikumTransaction = priceHistoryData.publikum.transaction[0];

  latestExFactoryValid.validTo = yesterday(newData.exFactoryPreisValid);
  latestExFactoryTransaction.validTo = yesterday();

  latestPublikumValid.validTo = yesterday(newData.publikumsPreisValid);
  latestPublikumTransaction.validTo = yesterday();

  priceHistoryData.exFactory.valid.unshift(getNewValid(newData, "exFactoryPreis", "exFactoryPreisValid"));
  priceHistoryData.exFactory.transaction.unshift(getNewTransaction(newData, "exFactoryPreis"));

  priceHistoryData.publikum.valid.unshift(getNewValid(newData, "publikumsPreis", "publikumsPreisValid"));
  priceHistoryData.publikum.transaction.unshift(getNewTransaction(newData, "publikumsPreis"));

  return priceHistoryData;
}

module.exports = updateBagPriceHistoryData;