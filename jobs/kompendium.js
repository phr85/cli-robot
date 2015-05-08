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
var renderDownloadStatus = require("../lib/kompendium/renderDownloadStatus");
var parseKompendium = require("../lib/kompendium/parseKompendium");

var cfg = {
  "download": {
    "url": "http://download.swissmedicinfo.ch/",
    "dir": path.resolve(__dirname, "../data/auto"),
    "zip": path.resolve(__dirname, "../data/auto/kompendium.zip"),
    "xml": path.resolve(__dirname, "../data/auto/kompendium.xml"),
    "zipFiles": [{
      name: /.xml/, dest: path.resolve(__dirname, "../data/auto/kompendium.xml")
    }]
  },
  "process": {
    "dir": path.resolve(__dirname, "../data/release/kompendium/"),
    "de": {
      "fi": path.resolve(__dirname, "../data/release/kompendium/de/fi"),
      "pi": path.resolve(__dirname, "../data/release/kompendium/de/pi")
    },
    "fr": {
      "fi": path.resolve(__dirname, "../data/release/kompendium/fr/fi"),
      "pi": path.resolve(__dirname, "../data/release/kompendium/fr/pi")
    },
    "it": {
      "fi": path.resolve(__dirname, "../data/release/kompendium/it/fi"),
      "pi": path.resolve(__dirname, "../data/release/kompendium/it/pi")
    },
    "catalog": path.resolve(__dirname, "../data/release/kompendium/catalog.json"),
    "json": path.resolve(__dirname, "../data/release/kompendium/kompendium.json"),
    "jsonMin": path.resolve(__dirname, "../data/release/kompendium/kompendium.min.json")
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
      log.time("Kompendium","Download");
      // set persistent agent which stores cookies
      return fetchHTML.setAgent(request.agent())(cfg.download.url);
    })
    .then(function (result) {
      return acceptTermsOfUse(result);
    })
    .then(function () {
      return fetchHTML(cfg.download.url);
    })
    .then(function (result) {
      // @TODO Improve and reuse progress renderer
      return startDownload(result, cfg.download.zip, function (progress) {
        log.doing("Kompendium", "Download", progress.percentage);
      });
    })
    .then(function () {
      log.timeEnd("Kompendium","Download");
      log.time("Kompendium", "Unzip");
      // @TODO Improve and reuse progress renderer
      return disk.unzip(cfg.download.zip, cfg.download.zipFiles, function (progress) {
        log.doing("Kompendium", "Unzip", progress.percentage);
      });
    })
    .then(function () {
      log.timeEnd("Kompendium", "Unzip");
      log.time("Kompendium", "Parse");
      return parseKompendium(cfg);
    })
    .then(function (parsedData) {
      log.timeEnd("Kompendium", "Parse");
      log.time("Kompendium", "Write Files");
      return Promise.all([
        disk.write.json(cfg.process.json, parsedData),
        disk.write.jsonMin(cfg.process.jsonMin, parsedData)
      ]);
    })
    .then(function () {
      log.timeEnd("Kompendium", "Write Files");
      log.timeEnd("Kompendium","Completed in");
      done(null);
    })
    .catch(function (err) {
      log.error(err);
      done(err);
    });
}

kompendium.cfg = cfg;

module.exports = kompendium;