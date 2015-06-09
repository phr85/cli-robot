"use strict";

var expect = require("chai").expect;

describe("createDataStore", function () {
  var createDataStore, data, collection;

  before(function () {
    createDataStore = require("../../../../lib/swissmedic/createDataStore");
  });

  beforeEach(function () {
    data = {"gtin": "unique", "a": "A", "b": "B"};
    collection = [data];
  });

  it("should map a given collection to a key-value object with gtin as key", function () {
    var ref = {};

    ref[data.gtin] = data;

    expect(createDataStore(collection)).to.deep.equal(ref);
  });

  it("should fail if a gtin is already taken", function () {
    collection.push(data);

    expect(function () {
      createDataStore(collection);
    }).to.throw();
  });

});