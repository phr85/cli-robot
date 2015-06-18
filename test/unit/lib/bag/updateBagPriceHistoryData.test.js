"use strict";

var expect = require("chai").expect;
var moment = require("moment");
var jsondiffpatch = require("jsondiffpatch");

describe("updateBagPriceHistoryData", function () {
  var testData, testDataGTIN;
  var dateFormat, releaseData, newValidFromDate, today;
  var createBagPriceHistoryData;
  var expectedResult;

  before(function () {
    dateFormat = "DD.MM.YYYY";
    releaseData = "15.03.1996";

    newValidFromDate = moment().subtract(3, "days").format(dateFormat);
    today = moment().format(dateFormat);
  });

  beforeEach(function () {
    // Note: This is only a subset of bag-data relevant for this test
    testDataGTIN = "1234567891011";
    testData = {
      history: {
        gtin: testDataGTIN,
        exFactoryPreis: "164.55",
        exFactoryPreisValid: "01.10.2011",
        publikumsPreis: "205.30",
        publikumsPreisValid: "01.10.2011",
        validFrom: releaseData
      },
      fresh: {
        gtin: testDataGTIN,
        exFactoryPreis: "165.45",
        exFactoryPreisValid: newValidFromDate,
        publikumsPreis: "210.50",
        publikumsPreisValid: newValidFromDate,
        validFrom: releaseData
      },
      priceHistory: {}
    };
    testData.diff = jsondiffpatch.diff(testData.history, testData.current);
    testData.priceHistory[testDataGTIN] = [{
      exFactoryPreis: testData.history.exFactoryPreis,
      publikumsPreis: testData.history.publikumsPreis,
      validFrom: testData.history.exFactoryPreisValid,
      validTo: null,
      transactionFrom: moment(testData.history.exFactoryPreisValid).add(3, "days").format(dateFormat),
      transactionTo: null
    }];

    createBagPriceHistoryData = require("../../../../lib/bag/updateBagPriceHistoryData");
  });

  describe("adding new entry to price history", function () {

    beforeEach(function () {
      expectedResult = [{
        exFactoryPreis: testData.fresh.exFactoryPreis,
        publikumsPreis: testData.fresh.publikumsPreis,
        validFrom: testData.fresh.publikumsPreisValid,
        validTo: null,
        transactionFrom: moment().format(dateFormat),
        transactionTo: null
      }, {
        exFactoryPreis: testData.history.exFactoryPreis,
        publikumsPreis: testData.history.publikumsPreis,
        validFrom: testData.priceHistory[testDataGTIN][0].validFrom,
        validTo: moment(testData.fresh.publikumsPreisValid, dateFormat).subtract(1, "days").format(dateFormat),
        transactionFrom: testData.priceHistory[testDataGTIN][0].transactionFrom,
        transactionTo: moment().subtract(1, "days").format(dateFormat)
      }];
    });

    it("should have updated price history data properly", function () {
      var newData = testData.fresh;
      var productPriceHistory = testData.priceHistory[testDataGTIN];

      productPriceHistory = createBagPriceHistoryData(newData, productPriceHistory);
      expect(productPriceHistory).to.deep.equal(expectedResult);
    });

  });
});