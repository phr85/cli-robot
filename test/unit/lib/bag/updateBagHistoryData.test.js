"use strict";

var expect = require("chai").expect;
var moment = require("moment");
var jsondiffpatch = require("jsondiffpatch");

describe("updateBagPriceHistoryData", function () {
  var testData, testDataGTIN;
  var dateFormat, releaseData, currentValidFromDate, historyValidToDate, newValidFromDate, today;
  var createBagPriceHistoryData;
  var expectedResult;

  before(function () {
    dateFormat = "DD.MM.YYYY";

    releaseData = "15.03.1996";
    currentValidFromDate = "01.10.2011";

    newValidFromDate = moment().subtract(3, "days").format(dateFormat);
    historyValidToDate = moment(currentValidFromDate, dateFormat).subtract(1, "days").format(dateFormat);
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
    testData.priceHistory[testDataGTIN] = {
      exFactory: {
        valid: [{
          price: testData.history.exFactoryPreis,
          validFrom: testData.history.exFactoryPreisValid,
          validTo: Infinity
        }],
        transaction: [{
          price: testData.history.exFactoryPreis,
          // time of detecting a change must not be necessary the same as in valid
          validFrom: moment(testData.history.exFactoryPreisValid).add(3, "days").format(dateFormat),
          validTo: Infinity
        }]
      },
      publikum: {
        valid: [{
          price: testData.history.publikumsPreis,
          validFrom: testData.history.publikumsPreisValid,
          validTo: Infinity
        }],
        transaction: [{
          price: testData.history.publikumsPreis,
          // time of detecting a change must not be necessary the same as in valid
          validFrom: moment(testData.history.publikumsPreis).add(3, "days").format(dateFormat),
          validTo: Infinity
        }]
      }
    };

    createBagPriceHistoryData = require("../../../../lib/bag/updateBagPriceHistoryData");
  });

  describe("adding new entry to price history", function () {

    describe("exFactory", function () {

      beforeEach(function () {
        expectedResult = {
          exFactory: {
            valid: [{
              price: testData.fresh.exFactoryPreis,
              validFrom: testData.fresh.exFactoryPreisValid,
              validTo: Infinity
            }, {
              price: testData.history.exFactoryPreis,
              validFrom: testData.priceHistory[testDataGTIN].exFactory.valid[0].validFrom,
              // validTo is exclusive
              validTo: moment(testData.fresh.exFactoryPreisValid, dateFormat).subtract(1, "days").format(dateFormat)
            }],
            transaction: [{
              price: testData.fresh.exFactoryPreis,
              validFrom: moment().format(dateFormat),
              validTo: Infinity
            }, {
              price: testData.history.exFactoryPreis,
              validFrom: testData.priceHistory[testDataGTIN].exFactory.transaction[0].validFrom,
              validTo: moment().subtract(1, "days").format(dateFormat)
            }]
          }
        };
      });

      it("should return a correct set of historical exFactory-data", function () {
        var newData = testData.fresh;
        var productPriceHistory = testData.priceHistory[testDataGTIN];

        productPriceHistory = createBagPriceHistoryData(newData, productPriceHistory);
        expect(productPriceHistory.exFactory).to.deep.equal(expectedResult.exFactory);
      });
    });

    describe("publikum", function () {

      beforeEach(function () {
        expectedResult = {
          publikum: {
            valid: [{
              price: testData.fresh.publikumsPreis,
              validFrom: testData.fresh.exFactoryPreisValid,
              validTo: Infinity
            },{
              price: testData.history.publikumsPreis,
              validFrom: testData.priceHistory[testDataGTIN].publikum.valid[0].validFrom,
              validTo: moment(testData.fresh.publikumsPreisValid, dateFormat).subtract(1, "days").format(dateFormat)
            }],
            transaction: [{
              price: testData.fresh.publikumsPreis,
              validFrom: moment().format(dateFormat),
              validTo: Infinity
            }, {
              price: testData.history.publikumsPreis,
              validFrom: testData.priceHistory[testDataGTIN].publikum.transaction[0].validFrom,
              validTo: moment().subtract(1, "days").format(dateFormat)
            }]
          }
        };
      });

      it("should return a correct set of historical publikum-data", function () {
        var newData = testData.fresh;
        var productPriceHistory = testData.priceHistory[testDataGTIN];

        productPriceHistory = createBagPriceHistoryData(newData, productPriceHistory);
        expect(productPriceHistory.publikum).to.deep.equal(expectedResult.publikum);
      });
    });

  });
});