"use strict";

var fs = require("fs");

var mkdirp = require("mkdirp");

var fileWriter = {
  /**
   *
   * @param {String} dir
   * @returns {fileWriter}
   */
  ensureDir: function (dir) {
    mkdirp.sync(dir);
    return this;
  },
  /**
   *
   * @param {*} src
   * @param {String} dest
   * @returns {fileWriter}
   */
  json: function (src, dest) {
    fs.writeFileSync(dest, this._jsonStringify(src));
    return this;
  },
  /**
   *
   * @param {*} src
   * @param {String} dest
   * @returns {fileWriter}
   */
  jsonMin: function (src, dest) {
    fs.writeFileSync(dest, this._jsonStringify(src, 3));
    return this;
  },
  /**
   *
   * @param {*} str
   * @param {Number?} space - optional
   * @returns {String}
   * @private
   */
  _jsonStringify: function (str, space) {
    return JSON.stringify(str, null, space);
  }
};

module.exports = fileWriter;