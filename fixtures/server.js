"use strict";

var url = require("url");
var path = require("path");
var fs = require("fs");

var express = require("express");

var swissmedic = require("../jobs/swissmedic");
var atc = require("../jobs/atc");
var bag = require("../jobs/bag");
var kompendium = require('../jobs/kompendium');

var app = express();
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var server;
var port = 3001;

app.use(cookieParser());
app.use(bodyParser());
app.use("*", function (req, res, next) {
  console.log("url:", req.originalUrl);
  next();
});

var atcDownloadPath =
  url.parse("http://www.wido.de/fileadmin/wido/downloads/pdf_arzneimittel/atc/wido_arz_amtl_atc-index_1214.zip").path;
var bagDownloadPath =
  url.parse("http://www.spezialitaetenliste.ch/File.axd?file=XMLPublications.zip").path;

//@TODO: Prefix urls/path with job-name like already @kompendium done
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
  },
  "kompendium": {
    "zip": path.resolve(__dirname, "../fixtures/kompendium/kompendium.zip"),
    "html": {
      "termsofuse": path.resolve(__dirname, "../fixtures/kompendium/termsofuse.html"),
      "warning": path.resolve(__dirname, "../fixtures/kompendium/warning.html")
    },
    "path": {
      "root": "/kompendium/",
      "termsofuse": "/kompendium/Accept.aspx",
      "warning": "/kompendium/",
      "download": "/kompendium/"
    },
    "sessionId": "25piejy24mgfct5xxgywwsyo",
    "authId": "546DA912D4945CB421F13D15DB35484162919F73537FBB308B5A75E2CDFFD3EC92751111EC7A6CE2AE6EA9E3C550E38339B3D7150487E9FCDE4D8587B15E5541F19A00E229E322F930C2FBE1AF0B982226B34B7ED516782810D5B0BDDC5CF027A775B1D2591745939D590DC54BC3202C6952CC2C1534FD98F04D6E7A53831F5E"
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

/**
 * Kompendium
 */
app.get(cfg.kompendium.path.root, function (req, res) {
  if (req.cookies["ASP.NET_SessionId"] !== cfg.kompendium.sessionId) {
    return res.redirect(302, cfg.kompendium.path.termsofuse);
  }
  if (req.cookies[".ASPXAUTH"] === cfg.kompendium.authId) {
   return fs.createReadStream(cfg.kompendium.html.warning).pipe(res);
  }
  res.redirect(302, cfg.kompendium.path.termsofuse);
});
/**
 * Kompendium Terms of use
 */
app.get(cfg.kompendium.path.termsofuse, function (req, res) {
  if (req.cookies["ASP.NET_SessionId"] !== cfg.kompendium.sessionId) {
    res.cookie("ASP.NET_SessionId", cfg.kompendium.sessionId);
  }

  fs.createReadStream(cfg.kompendium.html.termsofuse).pipe(res);
});
/**
 * Kompendium Download
 */
app.post(cfg.kompendium.path.root, function (req, res) {
  if (req.cookies["ASP.NET_SessionId"] !== cfg.kompendium.sessionId) {
    return res.redirect(cfg.kompendium.path.termsofuse);
  }
  if (req.cookies[".ASPXAUTH"] !== cfg.kompendium.authId) {
    return res.redirect(cfg.kompendium.path.termsofuse);
  }
  if (
    decodeURIComponent(req.body.__VIEWSTATE) === "/wEPDwULLTE4MTg5MDc1ODUPZBYCZg9kFgICAw9kFgICCw8WAh4LXyFJdGVtQ291bnQCBBYIZg9kFgRmDxUBCD9MYW5nPURFZAIBDw8WCB4EVGV4dAUCREUeB1Rvb2xUaXAFAkRFHglGb250X0JvbGRnHgRfIVNCAoAQZGQCAg9kFgRmDxUBCD9MYW5nPUZSZAIBDw8WCB8BBQJGUh8CBQJGUh8DaB8EAoAQZGQCBA9kFgRmDxUBCD9MYW5nPUlUZAIBDw8WCB8BBQJJVB8CBQJJVB8DaB8EAoAQZGQCBg9kFgRmDxUBCD9MYW5nPUVOZAIBDw8WCB8BBQJFTh8CBQJFTh8DaB8EAoAQZGRk2QRwGuwDmTP9wuh9ZN4+W+80KDhkD1Ns+NBP440vYCs=" &&
    decodeURIComponent(req.body.__VIEWSTATEGENERATOR) === "CA0B0334" &&
    decodeURIComponent(req.body.__EVENTVALIDATION) === "/wEdAAO68kJg0m9Y74zWK6lAkMqCYs46t3fbHVLzSTNxrdjIh8RrVmh3M0KCdbB64e6QzALYSqkas+eci1ihVtnszNvfiT8mKomwdsAqYdMgoAk0dg==" &&
    decodeURIComponent(req.body.ctl00$MainContent$BtnYes) === "Ja"
  ) {
    // serve second page
    res.set("Content-Disposition", "attachment; filename='kompendium.zip'");
    res.set("Content-Type", "octet-stream");
    res.sendFile(cfg.kompendium.zip);
    return;
  }

  res.status(500).send("Da da da!");
});
/**
 * Kompendium Accept Terms Of Use
 */
app.post(cfg.kompendium.path.termsofuse, function (req, res) {
  if (
    decodeURIComponent(req.body.__VIEWSTATE) === "/wEPDwUKLTkxMjA1NTgxMw9kFgJmD2QWAgIDD2QWAgILDxYCHgtfIUl0ZW1Db3VudAIEFghmD2QWBGYPFQEIP0xhbmc9REVkAgEPDxYIHgRUZXh0BQJERR4HVG9vbFRpcAUCREUeCUZvbnRfQm9sZGceBF8hU0ICgBBkZAICD2QWBGYPFQEIP0xhbmc9RlJkAgEPDxYIHwEFAkZSHwIFAkZSHwNoHwQCgBBkZAIED2QWBGYPFQEIP0xhbmc9SVRkAgEPDxYIHwEFAklUHwIFAklUHwNoHwQCgBBkZAIGD2QWBGYPFQEIP0xhbmc9RU5kAgEPDxYIHwEFAkVOHwIFAkVOHwNoHwQCgBBkZGQcCvr1OBN0kVKa+RG1xeFmpzVhAWi7l4TfCCTLv65KwA==" &&
    decodeURIComponent(req.body.__VIEWSTATEGENERATOR) === "00755B7A" &&
    decodeURIComponent(req.body.__EVENTVALIDATION) === "/wEdAAN6VmJ5sai2SB0W22sOLYr9qQpu/uYI9Zz7LH5/ck56li/biPuDFfzjQuE3we9OsCVPf9NlmASzP8L1mXLfpdoD6J/UgIg58iDDTXM6LiBO+Q==" &&
    decodeURIComponent(req.body.ctl00$MainContent$btnOK) === "Ja, ich akzeptiere / Oui, j’accepte / Sì, accetto"
  ) {
    res.cookie(".ASPXAUTH", cfg.kompendium.authId);

    // serve second page
    res.redirect(302, cfg.kompendium.path.root);
  }
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

exports.spinUp(function () {
  console.info("Server is up!");
});