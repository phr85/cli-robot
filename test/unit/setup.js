"use strict";

before(function () {
  var request = require("superagent");
  var cfg = require("./mocks/superagentMockCfg");

  require('superagent-mock')(request, cfg);
});