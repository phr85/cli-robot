"use strict";

var moment = require("moment");

var dateFormat = "DD.MM.YYYY";

/**
 *
 * @param {object} historyData
 * @param {object} newData
 * @param {object} priceHistoryData
 * @returns {{exFactory: {world: object, system: object}, publikum: {world: object, system: object}}
 */
function createBagPriceHistoryData(historyData, newData, priceHistoryData) {
  var exFactoryTransactionValidFrom, publikumTransactionValidFrom;
  var exFactoryTransactionValidTo, publikumTransactionValidTo;

  /**
   * Note: validFrom is inclusive while validTo is exclusive.
   */
  exFactoryTransactionValidFrom = priceHistoryData.exFactory.transaction[0].validTo;

  if (exFactoryTransactionValidFrom === Infinity) {
    exFactoryTransactionValidFrom = moment().format(dateFormat);

    exFactoryTransactionValidTo = Infinity;
  } else {
    exFactoryTransactionValidFrom = moment(exFactoryTransactionValidFrom, dateFormat);
    exFactoryTransactionValidFrom = exFactoryTransactionValidFrom.add(1, "days"); //incl.
    exFactoryTransactionValidFrom = exFactoryTransactionValidFrom.format(dateFormat);

    exFactoryTransactionValidTo = moment().subtract(1, "days").format(dateFormat); //excl.
  }


  publikumTransactionValidFrom = priceHistoryData.publikum.transaction[0].validTo;

  if (publikumTransactionValidFrom === Infinity) {
    publikumTransactionValidFrom = moment().format(dateFormat);

    publikumTransactionValidTo = Infinity;
  } else {
    publikumTransactionValidFrom = moment(publikumTransactionValidFrom, dateFormat);
    publikumTransactionValidFrom = publikumTransactionValidFrom.add(1, "days"); //incl.
    publikumTransactionValidFrom = publikumTransactionValidFrom.format(dateFormat);

    publikumTransactionValidTo = moment().subtract(1, "days").format(dateFormat); //excl.
  }

  return {
    exFactory: {
      valid: {
        price: historyData.exFactoryPreis,
        validFrom: historyData.exFactoryPreisValid,
        validTo: moment(newData.exFactoryPreisValid, dateFormat).subtract(1, "days").format(dateFormat)
      },
      transaction: {
        price: historyData.exFactoryPreis,
        validFrom: exFactoryTransactionValidFrom,
        validTo: exFactoryTransactionValidTo
      }
    },
    publikum: {
      valid: {
        price: historyData.publikumsPreis,
        validFrom: historyData.publikumsPreisValid,
        validTo: moment(newData.publikumsPreisValid, dateFormat).subtract(1, "days").format(dateFormat)
      },
      transaction: {
        price: historyData.publikumsPreis,
        validFrom: publikumTransactionValidFrom,
        validTo: publikumTransactionValidTo
      }
    }
  };
}

module.exports = createBagPriceHistoryData;