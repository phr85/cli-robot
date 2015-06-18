"use strict";

var moment = require("moment");

var df = "DD.MM.YYYY";

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
  var currentEntry = priceHistoryData[0];
  var newEntry;

  currentEntry.validTo = yesterday(newData.publikumsPreisValid);
  currentEntry.transactionTo = yesterday();

  newEntry = {
    exFactoryPreis: newData.exFactoryPreis,
    publikumsPreis: newData.publikumsPreis,
    validFrom: newData.publikumsPreisValid,
    validTo: null,
    transactionFrom: moment().format(df),
    transactionTo: null
  };

  // There is only day-based information, so if really something changes twice a day
  // this is the best we can do to work this around:
  if (moment(currentEntry.validFrom, df).isAfter(moment(currentEntry.validTo, df))) {
    currentEntry.validTo = currentEntry.validFrom;
  }
  if (moment(currentEntry.transactionFrom, df).isAfter(moment(currentEntry.transactionTo, df))) {
    currentEntry.transactionTo = currentEntry.transactionFrom;
  }

  priceHistoryData.unshift(newEntry);

  return priceHistoryData;
}

module.exports = updateBagPriceHistoryData;