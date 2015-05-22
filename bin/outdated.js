"use strict";

var log = require("../lib").log;
var outdated = require("../jobs/outdated");

log.debug("Outdated", "Start Outdated Check");

outdated()
  .then(function () {
    log.debug("Outdated", "Finished Outdated Check");
    process.exit(0); // OK
  })
  .catch(function (err) {
    log.error(err);
    process.exit(1); // Not OK
  });