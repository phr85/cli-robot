"use strict";

var log = require("../lib").log({
  service: "epha/robot/cronJob",
  transports: {level: ["ERROR", "WARN", "TRACE"]}
});
var outdated = require("./../jobs/outdated");

// DEBUG={DELAY} node bin/cronJob
var delay = parseInt(process.env.DELAY || (60 * 60 * 1000), 10);
var isRunning = false;

function runOutdated() {
  if (isRunning) {
    console.error("Outdated", "Start Canceled. A Job is already Running. Please check your given DELAY");
    return;
  }

  console.warn("Outdated", "Start");
  isRunning = true;

  outdated()
    .then(function () {
      isRunning = false;
      console.warn("Outdated", "Stop");
    })
    .catch(function () {
      console.error("Outdated", "Failed");
    });
}

runOutdated();
setInterval(runOutdated, delay);