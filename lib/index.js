"use strict";

// common libs

var log = require("epha-log");
var common = require("./common/common");

exports.log = log({
  service:require("../package.json").name,
  version:require("../package.json").version
});

exports.common = common;

exports.emil = require("./emil.js");

exports.util = require("./common/util.js");

// jobs & configs
var atc = require("../jobs/atc");
var bag = require("../jobs/bag");
var kompendium = require("../jobs/kompendium");
var swissmedic = require("../jobs/swissmedic");

exports.atc = atc;
exports.bag = bag;
exports.kompendium = kompendium;
exports.swissmedic = swissmedic;