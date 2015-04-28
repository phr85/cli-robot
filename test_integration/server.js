"use strict";

var url = require("url");
var path = require("path");
var fs = require("fs");

var express = require("express");
var rewire = require("rewire");

var config = {
  "swissmedic": rewire("../jobs/swissmedic").__get__("cfg")
};

var app = express();
var server;
var port = 3001;
var cfg = {
  "swissmedic": {
    "xlsx": path.resolve(__dirname, "./fixtures/swissmedic/swissmedic.xlsx"),
    "html": path.resolve(__dirname, "./fixtures/swissmedic/index.html"),
    "path": url.parse(config.swissmedic.download.url).path,
    "qs": { download: "NHzLpZeg7t,lnp6I0NTU042l2Z6ln1acy4Zn4Z2qZpnO2Yuq2Z6gpJCDdHx7hGym162epYbg2c_JjKbNoKSn6A--" }
  }
};

app.get(cfg.swissmedic.path, function (req, res) {
  // simulate download
  if (req.query.download === cfg.swissmedic.qs.download) {
    res.sendFile(cfg.swissmedic.xlsx);
    return;
  }

  // serve page
  fs.createReadStream(cfg.swissmedic.html).pipe(res);
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