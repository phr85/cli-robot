"use strict";

var url = require("url");
var path = require("path");
var fs = require("fs");

var express = require("express");

var config = require("../config.json");

var server = express();
var port = 3001;
var isUp = false;
var swissmedicDownloadPath = url.parse(config.swissmedic.download.url).path;
var qs = { download: "NHzLpZeg7t,lnp6I0NTU042l2Z6ln1acy4Zn4Z2qZpnO2Yuq2Z6gpJCDdHx7hGym162epYbg2c_JjKbNoKSn6A--"};

server.get(swissmedicDownloadPath, function (req, res) {
  // simulate download
  if (req.query.download === qs.download) {
    res.sendFile(path.resolve(__dirname, "./fixtures/swissmedic/download.xlsx"));
    return;
  }

  // serve page
  fs.createReadStream(path.resolve(__dirname, "./fixtures/swissmedic/index.html")).pipe(res);
});

exports.port = port;

exports.spinUp = function (done) {
  if(!isUp) {
    server.listen(port, done);
    isUp = true;
  }
};

//exports.spinUp(function () {
//  console.log("up");
//});