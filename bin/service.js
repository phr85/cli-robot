"use strict";

var moment = require("moment");

var robot = require("../package.json");
var log = require("epha-log")({
  service: robot.name,
  version: robot.version,
  transports: [{ level: ["ERROR", "WARN"] }],
  type: "module"
});
var outdated = require("./../jobs/outdated");

// DELAY={DELAY} node bin/service
var delay = parseInt(process.env.DELAY || (60 * 30 * 1000), 10);
var isRunning = false;

function runOutdated() {
  if (isRunning) {
    log.error("robot-service", moment().format("DD.MM.YYYY HH:mm") + " - Start Canceled. A Job is already Running. Please check your given DELAY");
    return;
  }

  log.warn("robot-service", moment().format("DD.MM.YYYY HH:mm") + " - Start Outdated Check");
  isRunning = true;

  outdated(log)
    .then(function () {
      isRunning = false;
      log.warn("robot-service", moment().format("DD.MM.YYYY HH:mm") + " - Finished Outdated Check");
    })
    .catch(function (err) {
      log.error("robot-service", moment().format("DD.MM.YYYY HH:mm") + " - Outdated Check Failed: ", err);
    });
}

runOutdated();
setInterval(runOutdated, delay);