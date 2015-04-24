"use strict";

var fs = require("fs");

var mkdirp = require("mkdirp");

var fileWriter = {
  /**
   *
   * @param {String, String, ...} dirs - one or many dirs which existence should be ensured
   * @returns {Promise}
   */
  ensureDir: function () {
    var promises = [];
    var dirs = Array.prototype.slice.call(arguments, 0); // cast arguments to Array

    dirs.forEach(function (dir) {
      promises.push(this._mkdirp(dir));
    }, this);

    return Promise.all(promises);
  },
  write: {
    /**
     *
     * @param {String} filename
     * @param {*} data
     * @returns {Promise}
     */
    json: function (filename, data) {
      return this._writeFile(filename, this._jsonStringify(data), data);
    },
    /**
     *
     * @param {String} filename
     * @param {*} data
     * @returns {Promise}
     */
    jsonMin: function (data, filename) {
      return this._writeFile(filename, this._jsonStringify(data, 3), data);
    },
    /**
     *
     * @param {*} data
     * @param {Number?} space - optional
     * @returns {String}
     * @private
     */
    _jsonStringify: function (data, space) {
      return JSON.stringify(data, null, space);
    },
    /**
     *
     * @param {String} filename
     * @param {String} json
     * @param {*} data
     * @returns {Promise}
     * @private
     */
    _writeFile: function (filename, json, data) {
      return new Promise(function (resolve, reject) {
        fs.writeFile(filename, json, function (err) {
          if (err) {
            return reject(err);
          }
          resolve(data)
        });
      });
    }
  },
  /**
   *
   * @param {String} dir
   * @returns {Promise}
   * @private
   */
  _mkdirp: function (dir) {
    return new Promise(function (resolve, reject) {
      mkdirp(dir, function (err) {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
};

module.exports = fileWriter;