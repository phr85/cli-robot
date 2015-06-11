"use strict";

var log = require("../lib").log;

var atc = require("../jobs/atc");
var bag = require("../jobs/bag");
var kompendium = require("../jobs/kompendium");
var swissmedic = require("../jobs/swissmedic");

Promise.all([
  atc(log),
  bag(log),
  kompendium(log),
  swissmedic(log)
]).then(function () {
  process.exit(0); //ok
}).catch(function (err) {
  console.error("\"all\" failed:");
  console.error(err);
  process.exit(1); //not ok
});