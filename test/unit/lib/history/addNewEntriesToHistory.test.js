"use strict";

var expect = require("chai").expect;

describe("swissmedic/addNewEntriesToHistory", function () {
  var addNewEntriesToHistory, historyStore, newEntriesStore, result;

  before(function () {
    addNewEntriesToHistory = require("../../../../lib/history/addNewEntriesToHistory");
  });

  before(function () {
    historyStore = { "oldGTIN": {} };
    newEntriesStore = { "newGTIN": {} };
  });

  it("should return an array with an object containing count of new entries", function () {
    var metrics;

    result = addNewEntriesToHistory(historyStore, newEntriesStore, function () {});
    metrics = result[1];

    expect(metrics.new).to.equal(1);
  });

});