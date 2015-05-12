"use strict";

var files = require("epha-files");

var path = require("path");

var request = require("superagent");
var jsdom = require("jsdom").jsdom;

var log = require("../lib").log;
var disk = require("../lib/disk");
var fetchHTML = require("../lib/fetchHTML");
var acceptTermsOfUse = require("../lib/kompendium/acceptTermsOfUse");
var startDownload = require("../lib/kompendium/startDownload");
var renderProgress = require("../lib/renderProgress");
var parseKompendium = require("../lib/kompendium/parseKompendium");

var baseDir = process.cwd();
var cfg = {
  "download": {
    "url": "http://download.swissmedicinfo.ch/",
    "dir": path.resolve(baseDir, "../data/auto"),
    "zip": path.resolve(baseDir, "../data/auto/kompendium.zip"),
    "xml": path.resolve(baseDir, "../data/auto/kompendium.xml"),
    "zipFiles": [{
      name: /.xml/, dest: path.resolve(baseDir, "../data/auto/kompendium.xml")
    }]
  },
  "process": {
    "dir": path.resolve(baseDir, "../data/release/kompendium/"),
    "de": {
      "fi": path.resolve(baseDir, "../data/release/kompendium/de/fi"),
      "pi": path.resolve(baseDir, "../data/release/kompendium/de/pi")
    },
    "fr": {
      "fi": path.resolve(baseDir, "../data/release/kompendium/fr/fi"),
      "pi": path.resolve(baseDir, "../data/release/kompendium/fr/pi")
    },
    "it": {
      "fi": path.resolve(baseDir, "../data/release/kompendium/it/fi"),
      "pi": path.resolve(baseDir, "../data/release/kompendium/it/pi")
    },
    "catalog": path.resolve(baseDir, "../data/release/kompendium/catalog.json"),
    "json": path.resolve(baseDir, "../data/release/kompendium/kompendium.json"),
    "jsonMin": path.resolve(baseDir, "../data/release/kompendium/kompendium.min.json")
  }
};

/**
 * @param {function (null|Error)} done
 */
function kompendium(done) {

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
      return startDownload(result, cfg.download.zip, renderProgress("Kompendium", "Download"));
    })
    .then(function () {
      log.timeEnd("Kompendium", "Download");
      log.debug("Kompendium", "Unzip");
      log.time("Kompendium", "Unzip");
      return disk.unzip(cfg.download.zip, cfg.download.zipFiles, renderProgress("Kompendium", "Unzip"));
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
      log.error(err);
      done(err);
    });
}

kompendium.cfg = cfg;

module.exports = kompendium;