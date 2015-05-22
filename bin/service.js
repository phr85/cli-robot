"use strict";

var robot = require("../package.json");
var log = require("epha-log")({
  service: robot.name,
  version: robot.version,
  transports: [{ level: ["ERROR", "WARN"] }],
  type: "module"
});
var outdated = require("./../jobs/outdated");

// DELAY={DELAY} node bin/cronJob
var delay = parseInt(process.env.DELAY || (60 * 60 * 1000), 10);
var isRunning = false;

function runOutdated() {
  if (isRunning) {
    log.error("cronjob", "Start Canceled. A Job is already Running. Please check your given DELAY");
    return;
  }

  console.warn("cronjob", "Start Outdated Check");
  isRunning = true;

  outdated(log)
    .then(function () {
      isRunning = false;
      log.warn("cronjob", "Outdated Check Finished");
    })
    .catch(function (err) {
      log.error("cronjob", " Outdated Check Failed: ", err);
    });
}

runOutdated();
setInterval(runOutdated, delay);