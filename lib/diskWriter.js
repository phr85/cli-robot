"use strict";

var mkdirp = require("mkdirp");

var fileWriter = {
  ensureDir: function (dir) {
    mkdirp.sync(dir);
  }
};

module.exports = fileWriter;