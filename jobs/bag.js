"use strict";

var path = require("path");
var cwd = process.cwd();

var defaultLog = require("../lib").log;
var disk = require("../lib/common/disk");
var fetchHTML  = require("../lib/common/fetchHTML");
var parseLink = require("../lib/common/parseLink");
var downloadFile = require("../lib/common/downloadFile");
var renderProgress = require("../lib/common/renderProgress");

var parseBAGXML = require("../lib/bag/parseBAGXML");
var parseITCodes = require("../lib/bag/parseITCodes");

var bagHistory = require('./bagHistory');

var cfg = {
  "download": {
    "dir": path.resolve(cwd, "data/auto/bag"),
    "url": "http://www.spezialitaetenliste.ch/",
    "linkRegex": /href="(.*)".*Publikation als XML-Dateien/g,
    "name": path.resolve(cwd, "data/auto/bag/XMLPublications.zip"),
    "unzip": [{
      name: /Preparations.xml/, dest: path.resolve(cwd, "data/auto/bag/bag.xml")
    }, {
      name: /Publications.xls/, dest: path.resolve(cwd, "data/auto/bag/bag.xls")
    }, {
      name: /ItCodes.xml/, dest: path.resolve(cwd, "data/auto/bag/it.xml")
    }]
  },
  "release": {
    "dir": path.resolve(cwd, "data/release/bag"),
    "file": path.resolve(cwd, "data/release/bag/bag.json"),
    "minFile": path.resolve(cwd, "data/release/bag.min.json"),
    "it": path.resolve(cwd, "data/release/bag/it.json"),
    "itMin": path.resolve(cwd, "data/release/bag/it.min.json")
  },
  "history": {
    "dir": path.resolve(cwd, "data/release/bag"),
    "file": path.resolve(cwd, "data/release/bag/bag.history.json"),
    "minFile": path.resolve(cwd, "data/release/bag/bag.history.min.json"),
    "price": path.resolve(cwd, "data/release/bag/bag.price-history.json"),
    "priceMin": path.resolve(cwd, "data/release/bag/bag.price-history.min.json")
  },
  "log": {
    "dir": path.resolve(cwd, "log/bag"),
    "deRegistered": path.resolve(cwd, "log/bag/bag.de-registered.log"),
    "changes": path.resolve(cwd, "log/bag/bag.changes.log"),
    "new": path.resolve(cwd, "data/release/bag/bag.new.log")
  }
};

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function bag(log) {

  log = log || defaultLog;

  log.info("BAG", "Get, Load and Parse");
  log.time("BAG", "Completed in");

  return new Promise(function (resolve, reject) {
    disk.ensureDir(cfg.download.dir, cfg.release.dir)
      .then(function () {
        log.debug("BAG", "Go to " + cfg.download.url);
        log.time("BAG", "Go to");
        return fetchHTML(cfg.download.url);
      })
      .then(function (result) {
        log.timeEnd("BAG", "Go to");
        log.debug("BAG", "Parse Link");
        log.time("BAG", "Parse Link");
        return parseLink(cfg.download.url, result.html, cfg.download.linkRegex);
      })
      .then(function (parsedLink) {
        log.timeEnd("BAG", "Parse Link");
        log.debug("BAG", "Parsed Link: " + parsedLink);
        log.time("BAG", "Download");
        return downloadFile(parsedLink, cfg.download.name, renderProgress("BAG", "Download", log));
      })
      .then(function () {
        log.timeEnd("BAG", "Download");
        log.debug("BAG", "Unzip");
        log.time("BAG", "Unzip");
        return disk.unzip(cfg.download.name, cfg.download.unzip, renderProgress("ATC", "Unzip", log));
      })
      .then(function () {
        var reparationsXmlFile = cfg.download.unzip[0].dest;
        var itCodesXmlFile = cfg.download.unzip[0].dest;

        log.timeEnd("BAG", "Unzip");
        log.debug("BAG", "Process Files");
        log.time("BAG", "Process Files");

        return Promise.all([
          parseBAGXML(reparationsXmlFile, log),
          parseITCodes(itCodesXmlFile)
        ]);
      })
      .then(function (parsedData) {
        var bag = parsedData[0];
        var it = parsedData[1];

        log.timeEnd("BAG", "Process Files");
        log.debug("BAG", "Write Processed Files");
        log.time("BAG", "Write Processed Files");

        return Promise.all([
          disk.write.json(cfg.release.file, bag),
          disk.write.jsonMin(cfg.release.minFile, bag),
          disk.write.json(cfg.release.it, it),
          disk.write.jsonMin(cfg.release.itMin, it)
        ]);
      })
      .then(function () {
        return bagHistory(log);
      })
      .then(function () {
        log.timeEnd("BAG", "Write Processed Files");
        log.debug("BAG", "Done");
        log.timeEnd("BAG", "Completed in");
        resolve();
      })
      .catch(function (err) {
        log.error(err.name, err.message, err.stack);
        reject(err);
      });
  });
}

module.exports = bag;