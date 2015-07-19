"use strict";

var path = require("path");
var cwd = process.cwd();

var request = require("request");

var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");
var fetchHTML = require("../lib/common/fetchHTML");

var acceptTermsOfUse = require("../lib/kompendium/acceptTermsOfUse");
var startDownload = require("../lib/kompendium/startDownload");
var renderProgress = require("../lib/common/renderProgress");
var parseKompendium = require("../lib/kompendium/parseKompendium");

var cfg = {
  "download": {
    "dir": path.resolve(cwd, "data/auto/kompendium"),
    "url": "http://download.swissmedicinfo.ch/",
    "name": path.resolve(cwd, "data/auto/kompendium/kompendium.zip"),
    "unzip": [{
      name: /.xml/, dest: path.resolve(cwd, "data/auto/kompendium/kompendium.xml")
    }]
  },
  "release": {
    "dir": path.resolve(cwd, "data/release/kompendium"),
    "de": {
      "fi": path.resolve(cwd, "data/release/kompendium/de/fi"),
      "pi": path.resolve(cwd, "data/release/kompendium/de/pi")
    },
    "fr": {
      "fi": path.resolve(cwd, "data/release/kompendium/fr/fi"),
      "pi": path.resolve(cwd, "data/release/kompendium/fr/pi")
    },
    "it": {
      "fi": path.resolve(cwd, "data/release/kompendium/it/fi"),
      "pi": path.resolve(cwd, "data/release/kompendium/it/pi")
    },
    "catalog": path.resolve(cwd, "data/release/kompendium/catalog.json"),
    "file": path.resolve(cwd, "data/release/kompendium/kompendium.json"),
    "minFile": path.resolve(cwd, "data/release/kompendium/kompendium.min.json")
  }
};


/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function kompendium(log) {

  log = log || defaultLog;

  log.info("Kompendium","Get, Load and Parse");
  log.time("Kompendium","Completed in");

  return new Promise(function (resolve, reject) {
    disk.ensureDir(
      cfg.download.dir, cfg.release.dir,
      cfg.release.de.fi, cfg.release.de.pi,
      cfg.release.fr.fi, cfg.release.fr.pi,
      cfg.release.it.fi, cfg.release.it.pi
    )
      .then(function () {
        log.debug("Kompendium", "Go to " + cfg.download.url);
        log.time("Kompendium", "Go to");
        // set persistent agent which stores cookies
        return fetchHTML.setAgent(request.defaults({jar: request.jar()}))(cfg.download.url);
      })
      .then(function (result) {
        log.timeEnd("Kompendium", "Go to");
        log.debug("Kompendium", "Accept Terms Of Use");
        log.time("Kompendium", "Accept Terms Of Use");
        return acceptTermsOfUse(cfg.download.url, result);
      })
      .then(function (result) {
        log.timeEnd("Kompendium", "Accept Terms Of Use");
        log.debug("Kompendium", "Re-visit " + cfg.download.url);
        log.time("Kompendium", "Re-visit");
        return fetchHTML.setAgent(result.agent)(cfg.download.url);
      })
      .then(function (result) {
        log.timeEnd("Kompendium", "Re-visit");
        log.debug("Kompendium", "Start Download");
        log.time("Kompendium", "Download");
        return startDownload(cfg.download.url, cfg.download.name, result, renderProgress("Kompendium", "Download", log));
      })
      .then(function () {
        log.timeEnd("Kompendium", "Download");
        log.debug("Kompendium", "Unzip");
        log.time("Kompendium", "Unzip");
        return disk.unzip(cfg.download.name, cfg.download.unzip, renderProgress("Kompendium", "Unzip", log));
      })
      .then(function () {
        log.timeEnd("Kompendium", "Unzip");
        log.debug("Kompendium", "Process Files");
        log.time("Kompendium", "Process Files");
        return parseKompendium(cfg, log);
      })
      .then(function (parsedData) {
        log.timeEnd("Kompendium", "Process Files");
        log.debug("Kompendium", "Write Processed Files");
        log.time("Kompendium", "Write Files");
        return Promise.all([
          disk.write.json(cfg.release.file, parsedData),
          disk.write.jsonMin(cfg.release.minFile, parsedData)
        ]);
      })
      .then(function () {
        log.timeEnd("Kompendium", "Write Processed Files");
        log.debug("Kompendium", "Done");
        log.timeEnd("Kompendium", "Completed in");
        resolve();
      })
      .catch(function (err) {
        log.error(err.name, err.message, err.stack);
        reject(err);
      });
  });
}

module.exports = kompendium;