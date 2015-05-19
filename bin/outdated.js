"use strict";

var atcCfg = require("../jobs/cfg/atc.cfg");
var bagCfg = require("../jobs/cfg/bag.cfg");
//var kompenidumCfg = require();
var swissmedicCfg = require("../jobs/cfg/swissmedic.cfg");

var log = require("../lib").log;
var compareFileSize = require("../lib/compare/compareFileSize");

Promise.all([
  compareFileSize("ATC", atcCfg),
  compareFileSize("BAG", bagCfg),
  compareFileSize("Swissmedic", swissmedicCfg)
]).then(function() {
  log.info("Out-dated check is finished");
  process.exit(0);
}).catch(function (err) {
  log.error(err);
  process.exit(1); //not ok
});