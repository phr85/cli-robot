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
var atcCfg = require("../jobs/cfg/atc.cfg.js");

var bag = require("../jobs/bag");
var bagCfg = require("../jobs/cfg/bag.cfg.js");

var kompendium = require("../jobs/kompendium");
var kompendiumCfg = require("../jobs/cfg/kompendium.cfg.js");

var swissmedic = require("../jobs/swissmedic");
var swissmedicCfg = require("../jobs/cfg/swissmedic.cfg.js");


atc.cfg = atcCfg;
bag.cfg = bagCfg;
kompendium.cfg = bagCfg;
swissmedic.cfg = swissmedicCfg;


exports.atc = atc;
exports.bag = bag;
exports.kompendium = kompendium;
exports.swissmedic = swissmedic;