"use strict";

var fs = require("fs");

var path = require("path");

var baseDir = process.cwd();
var cfg = require("./cfg/bag.cfg.js");

var log = require("../lib").log;
var disk = require("../lib/common/disk");
var fetchHTML  = require("../lib/common/fetchHTML");
var parseLink = require("../lib/common/parseLink");
var downloadFile = require("../lib/common/downloadFile");
var renderProgress = require("../lib/common/renderProgress");
var parseBAGXML = require("../lib/bag/parseBAGXML");
var parseITCodes = require("../lib/bag/parseITCodes");

/**
 *
 * @param {function(Error|null)} done
 */
function bag(done) {

  log.info("BAG", "Get, Load and Parse");
  log.time("BAG", "Completed in");

  disk.ensureDir(cfg.download.dir, cfg.process.dir)
    .then(function () {
      log.debug("BAG", "Go to " + cfg.download.url);
      log.time("BAG", "Go to");
      return fetchHTML(cfg.download.url);
    })
    .then(function (result) {
      log.timeEnd("BAG", "Go to");
      log.debug("BAG", "Parse Link");
      log.time("BAG", "Parse Link");
      return parseLink(cfg.download.url, result.html, cfg.download.linkParser);
    })
    .then(function (parsedLink) {
      log.timeEnd("BAG", "Parse Link");
      log.debug("BAG", "Parsed Link: " + parsedLink);
      log.time("BAG", "Download");
      return downloadFile(parsedLink, cfg.download.file, renderProgress("BAG", "Download"));
    })
    .then(function () {
      log.timeEnd("BAG", "Download");
      log.debug("BAG", "Unzip");
      log.time("BAG", "Unzip");
      return disk.unzip(cfg.download.file, cfg.download.zipFiles, renderProgress("ATC", "Unzip"));
    })
    .then(function () {
      log.timeEnd("BAG", "Unzip");
      log.debug("BAG", "Process Files");
      log.time("BAG", "Process Files");

      return Promise.all([
        parseBAGXML(cfg.download.zipFiles[0].dest),
        parseITCodes(cfg.download.zipFiles[2].dest)
      ]);
    })
    .then(function (parsedData) {
      var bag = parsedData[0];
      var it = parsedData[1];

      log.timeEnd("BAG", "Process Files");
      log.debug("BAG", "Write Processed Files");
      log.time("BAG", "Write Processed Files");

      return Promise.all([
        disk.write.json(cfg.process.bag, bag),
        disk.write.jsonMin(cfg.process.bagMin, bag),
        disk.write.json(cfg.process.it, it),
        disk.write.jsonMin(cfg.process.itMin, it)
      ]);
    })
    .then(function () {
      log.timeEnd("BAG", "Write Processed Files");
      log.debug("BAG", "Done");
      log.timeEnd("BAG", "Completed in");
      done(null);
    })
    .catch(function (err) {
      log.error(err);
      done(err);
    });
}

module.exports = bag;