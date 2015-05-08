"use strict";

var atc = require("../jobs/atc");
var bag = require("../jobs/bag");
var kompendium = require("../jobs/kompendium");
var swissmedic = require("../jobs/swissmedic");

Promise.all([
  new Promise(function (resolve, reject) {
    atc(function (err) {
      !!err ? reject(err) : resolve();
    });
  }),
  new Promise(function (resolve, reject) {
    bag(function (err) {
      !!err ? reject(err) : resolve();
    });
  }),
  new Promise(function (resolve, reject) {
    kompendium(function (err) {
      !!err ? reject(err) : resolve();
    });
  }),
  new Promise(function (resolve, reject) {
    swissmedic(function (err) {
      !!err ? reject(err) : resolve();
    });
  })
]).then(function () {
  process.exit(0); //ok
}).catch(function (err) {
  console.error("\"all\" failed:");
  console.error(err);
  process.exit(1); //not ok
});