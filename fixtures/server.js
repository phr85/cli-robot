"use strict";

var url = require("url");
var path = require("path");
var fs = require("fs");

var express = require("express");

var swissmedic = require("../jobs/swissmedic");
var atc = require("../jobs/atc");
var bag = require("../jobs/bag");

var app = express();
var server;
var port = 3001;

var atcDownloadPath =
  url.parse("http://www.wido.de/fileadmin/wido/downloads/pdf_arzneimittel/atc/wido_arz_amtl_atc-index_1214.zip").path;
var bagDownloadPath =
  url.parse("http://www.spezialitaetenliste.ch/File.axd?file=XMLPublications.zip").path;

var cfg = {
  "swissmedic": {
    "xlsx": path.resolve(__dirname, "../fixtures/swissmedic/swissmedic.xlsx"),
    "html": path.resolve(__dirname, "../fixtures/swissmedic/index.html"),
    "path": url.parse(swissmedic.cfg.download.url).path,
    "qs": { download: "NHzLpZeg7t,lnp6I0NTU042l2Z6ln1acy4Zn4Z2qZpnO2Yuq2Z6gpJCDdHx7hGym162epYbg2c_JjKbNoKSn6A--" }
  },
  "atc": {
    "xlsx": path.resolve(__dirname, "../fixtures/atc/atc.xlsx"),
    "zip": path.resolve(__dirname, "../fixtures/atc/atc.zip"),
    "html": path.resolve(__dirname, "../fixtures/atc/amtl_atc-code.html"),
    "path": url.parse(atc.cfg.download.url).path,
    "downloadPath": atcDownloadPath
  },
  "bag": {
    "zip": path.resolve(__dirname, "../fixtures/bag/bag.zip"),
    "bagXLS": path.resolve(__dirname, "../fixtures/bag/bag.xls"),
    "bagXML": path.resolve(__dirname, "../fixtures/bag/bag.xml"),
    "itXML": path.resolve(__dirname, "../fixtures/bag/it.xml"),
    "html": path.resolve(__dirname, "..fixtures/bag/index.html"),
    "path": url.parse(bag.cfg.download.url),
    "downloadPath": bagDownloadPath
  }
};

/**
 * Swissmedic
 */
app.get(cfg.swissmedic.path, function (req, res) {
  // simulate download
  if (req.query.download === cfg.swissmedic.qs.download) {
    res.sendFile(cfg.swissmedic.xlsx);
    return;
  }

  // serve page
  fs.createReadStream(cfg.swissmedic.html).pipe(res);
});

/**
 * ATC
 */
app.get(cfg.atc.path, function (req, res) {
  // serve page
  fs.createReadStream(cfg.atc.html).pipe(res);
});
app.get(cfg.atc.downloadPath, function (req, res) {
  res.sendFile(cfg.atc.zip);
});

/**
 * BAG
 */
app.get(cfg.bag.path, function (req, res) {
  // serve page
  fs.createReadStream(cfg.bag.html).pipe(res);
});
app.get(cfg.bag.downloadPath, function (req, res) {
  res.sendFile(cfg.bag.zip);
});

exports.cfg = cfg;
exports.port = port;

/**
 *
 * @param {function(Error|null)} done
 */
exports.spinUp = function (done) {
  server = app.listen(port, done);
};

/**
 *
 * @param {function(Error|null)} done
 */
exports.spinDown = function (done) {
  server.close(done);
};