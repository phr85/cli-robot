"use strict";

var fs = require("fs");
var path = require("path");

var rmdir = require("rmdir");

var server = require('./server');

function cleanUp(done) {
  var cleanPath = path.resolve(__dirname, "./tmp");

  fs.lstat(cleanPath, function (err) {
    if (err && err.code === "ENOENT") {
      return done();
    }
    if (err && err.code !== "ENOENT") {
      return done(err);
    }
    rmdir(cleanPath, done);
  });
}

before(function (done) {
  console.info("before: cleanup");
  cleanUp(done);
});

before(function (done) {
  console.info("before: start integration testing server");
  server.spinUp(done);
});

after(function (done) {
  console.info("after: stop integration testing server");
  server.spinDown(done);
});

after(function (done) {
  console.info("after: cleanUp");
  cleanUp(done);
});