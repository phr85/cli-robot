"use strict";

var expect = require("chai").expect;

describe("createDataStore", function () {
  var createDataStore, data, collection, log;

  before(function () {
    createDataStore = require("../../../../lib/history/createDataStore");
    log = { warn: function () { /* do nothing */}};
  });

  beforeEach(function () {
    data = {"gtin": "unique", "a": "A", "b": "B"};
    collection = [data];
  });

  it("should map a given collection to a key-value object with gtin as key", function () {
    var ref = {};

    ref[data.gtin] = data;

    expect(createDataStore(collection), log).to.deep.equal(ref);
  });

  it("should not include a identical copy in created data store", function () {
    var dataStore;

    collection.push(JSON.parse(JSON.stringify(data)));
    dataStore = createDataStore(collection, log);
    expect(Object.keys(dataStore)).to.have.length(1);
  });

  it("should create an synthetic identifier if gtin is already taken and data is different", function () {
    var dataStore, entryCopy, syntehticId;

    entryCopy = JSON.parse(JSON.stringify(data));
    entryCopy.a = "a";

    collection.push(entryCopy);
    dataStore = createDataStore(collection, log);

    delete dataStore.unique;

    syntehticId = Object.keys(dataStore)[0];

    expect(dataStore[syntehticId]).to.equal(entryCopy);
  });

});