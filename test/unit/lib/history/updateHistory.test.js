"use strict";

var expect = require("chai").expect;

describe("updateHistory", function () {
  var updateHistory, historyStore, newStore, result;

  // @TODO do something more useful with onChanged
  function onChanged() {
    return true;
  }
  function onDeRegistered() {
    return true;
  }

  before(function () {
    updateHistory = require("../../../../lib/history/updateHistory");
  });

  before(function () {
    historyStore = {
      "gtinWillBeDeRegistered": {"zulassung": "00001"},
      "unchangedGtin": {"zulassung": "00002"},
      "changedGtin": {"zulassung": "00003", gueltigkeitsdatum: "01.01.2020"}
    };
    newStore = {
      "unchangedGtin": {"zulassung": "00002"},
      "changedGtin": {"zulassung": "00003", gueltigkeitsdatum: "01.01.2030"},
      "newGtin": {"zulassung": "00004"}
    };

    result = updateHistory(historyStore, newStore, onChanged, onDeRegistered);
  });

  it("should return an array with a reference to given historyStore at Index 0", function () {
    expect(result[0]).to.equal(historyStore);
  });

  it("should return an array with a reference to given newStore at Index 1", function () {
    expect(result[1]).to.equal(newStore);
  });

  it("should return an array with an object containing some metrics (updated, deRegistered, unChanged)", function () {
    var metrics = result[2];

    expect(metrics.updated).to.equal(1);
    expect(metrics.deRegistered).to.equal(1);
    expect(metrics.unChanged).to.equal(1);
  });

});