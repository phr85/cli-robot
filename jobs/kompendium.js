"use strict";

var path = require("path");

var request = require("superagent");

var cfg = require("./cfg/kompendium.cfg.js");
var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");
var fetchHTML = require("../lib/common/fetchHTML");
var acceptTermsOfUse = require("../lib/kompendium/acceptTermsOfUse");
var startDownload = require("../lib/kompendium/startDownload");
var renderProgress = require("../lib/common/renderProgress");
var parseKompendium = require("../lib/kompendium/parseKompendium");

/**
 * @param {function (null|Error)} done
 * @param {Log|console?} log - optional
 */
function kompendium(done, log) {

  log = log || defaultLog;

  log.info("Kompendium","Get, Load and Parse");
  log.time("Kompendium","Completed in");

  disk.ensureDir(
    cfg.download.dir, cfg.process.dir,
    cfg.process.de.fi, cfg.process.de.pi,
    cfg.process.fr.fi, cfg.process.fr.pi,
    cfg.process.it.fi, cfg.process.it.pi
  )
    .then(function () {
      log.debug("Kompendium", "Go to " + cfg.download.url);
      log.time("Kompendium", "Go to");
      // set persistent agent which stores cookies
      return fetchHTML.setAgent(request.agent())(cfg.download.url);
    })
    .then(function (result) {
      log.timeEnd("Kompendium", "Go to");
      log.debug("Kompendium", "Accept Terms Of Use");
      log.time("Kompendium", "Accept Terms Of Use");
      return acceptTermsOfUse(result);
    })
    .then(function () {
      log.timeEnd("Kompendium", "Accept Terms Of Use");
      log.debug("Kompendium", "Re-visit " + cfg.download.url);
      log.time("Kompendium", "Re-visit");
      return fetchHTML(cfg.download.url);
    })
    .then(function (result) {
      log.timeEnd("Kompendium", "Re-visit");
      log.debug("Kompendium", "Start Download");
      log.time("Kompendium", "Download");
      return startDownload(result, cfg.download.file, renderProgress("Kompendium", "Download", log));
    })
    .then(function () {
      // throw away agent as any other job should use a fresh one
      fetchHTML.setAgent(null);
    })
    .then(function () {
      log.timeEnd("Kompendium", "Download");
      log.debug("Kompendium", "Unzip");
      log.time("Kompendium", "Unzip");
      return disk.unzip(cfg.download.file, cfg.download.zipFiles, renderProgress("Kompendium", "Unzip", log));
    })
    .then(function () {
      log.timeEnd("Kompendium", "Unzip");
      log.debug("Kompendium", "Process Files");
      log.time("Kompendium", "Process Files");
      return parseKompendium(cfg);
    })
    .then(function (parsedData) {
      log.timeEnd("Kompendium", "Process Files");
      log.debug("Kompendium", "Write Processed Files");
      log.time("Kompendium", "Write Files");
      return Promise.all([
        disk.write.json(cfg.process.json, parsedData),
        disk.write.jsonMin(cfg.process.jsonMin, parsedData)
      ]);
    })
    .then(function () {
      log.timeEnd("Kompendium", "Write Processed Files");
      log.debug("Kompendium", "Done");
      log.timeEnd("Kompendium", "Completed in");
      done(null);
    })
    .catch(function (err) {
      log.error(err.name, err.message, err.stack);
      done(err);
    });
}

module.exports = kompendium;