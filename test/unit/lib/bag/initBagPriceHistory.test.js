"use strict";

var expect = require("chai").expect;
var rewire = require("rewire");
var moment = require("moment");

describe("initBagPriceHistory", function () {
  var initBagPriceHistory, cfgMock, createDataStoreMock, diskMock, bagDataStore;
  var gtin1, gtin2;
  var df;

  before(function () {
    cfgMock = {release: {file: ""}, history: {price: "", priceMin: ""}};

    gtin1 = "123456789101111";
    gtin2 = "123456789101112";

    bagDataStore = {};

    bagDataStore[gtin1] = {
      exFactoryPreis: "100",
      exFactoryPreisValid: "01.01.2011",
      publikumsPreis: "200",
      publikumsPreisValid: "01.01.2011"
    };

    bagDataStore[gtin2] = {
      exFactoryPreis: "200",
      exFactoryPreisValid: "02.02.2012",
      publikumsPreis: "400",
      publikumsPreisValid: "02.02.2012"
    };

    createDataStoreMock = function() {
      return bagDataStore;
    };

    df = "DD.MM.YYYY";

    diskMock = {
      read: {
        jsonFile: function () {
          return new Promise(function (resolve) {
            resolve();
          });
        }
      },
      write: {
        json: function (filePath, priceHistory) {
          return priceHistory;
        },
        jsonMin: function (filePath, priceHistory) {
          return priceHistory;
        }
      }
    };

    initBagPriceHistory = rewire("../../../../lib/bag/initBagPriceHistory");
    initBagPriceHistory.__set__({
      "createDataStore": createDataStoreMock,
      "disk": diskMock
    });
  });

  it("should create a proper priceHistory", function (done) {
    var expected = {};

    expected[gtin1] = [{
      exFactoryPreis: bagDataStore[gtin1].exFactoryPreis,
      publikumsPreis: bagDataStore[gtin1].publikumsPreis,
      validFrom: bagDataStore[gtin1].publikumsPreisValid,
      validTo: null,
      transactionFrom: moment().format(df),
      transactionTo: null
    }];

    expected[gtin2] = [{
      exFactoryPreis: bagDataStore[gtin2].exFactoryPreis,
      publikumsPreis: bagDataStore[gtin2].publikumsPreis,
      validFrom: bagDataStore[gtin2].publikumsPreisValid,
      validTo: null,
      transactionFrom: moment().format(df),
      transactionTo: null
    }];

    initBagPriceHistory(cfgMock)
      .then(function (priceHistory) {
        expect(priceHistory).to.deep.equal(expected);
        done();
      })
      .catch(done);

  });
});