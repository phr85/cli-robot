"use strict";

var fs = require("fs");
var unzip = require("unzip");

var parseCSV = require("csv-parse");
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
  /**
   * @TODO
   * @param {String} zipname - full path to zip file which should be unzipped
   * @param {[String|RegExp]|String|RegExp} wanted - file(s) which should be unzipped
   * @param {String} dest - destination of file
   * @returns {Promise}
   */
  unzip: function (zipname, wanted, dest) {
    var self = this;

    return new Promise(function (resolve, reject) {
      var readStream = fs.createReadStream(zipname);
      var p = [];

      readStream.pipe(unzip.Parse()).on("entry", function (entry) {
        if (self._match(wanted, entry.path)) {
          p.push(new Promise(function (_resolve, _reject) {
            var writeStream = fs.createWriteStream(dest);

            writeStream.on("error", _reject);
            writeStream.on("finish", _resolve);

            entry.pipe(writeStream);
          }));
        } else {
          entry.autodrain();
        }
      });
      readStream.on("error", reject);
      readStream.on("end", function () {
        Promise.all(p).then(resolve).catch(reject);
      });
    });
  },
  read: {
    /**
     *
     * @param {String} filename
     * @returns {Promise}
     */
    csv: function (filename) {
      return this.file(filename).then(function (data) {
          return new Promise(function (resolve, reject) {
            parseCSV(data, function (err, parsedData) {
              err ? reject(err) : resolve(parsedData);
            });
          });
        });
    },
    /**
     *
     * @param {String} filename
     * @returns {Promise}
     */
    file: function (filename) {
      return new Promise(function (resolve, reject) {
        fs.readFile(filename, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
  },
  write: {
    /**
     *
     * @param {String} filename
     * @param {*} data
     * @returns {Promise}
     */
    json: function (filename, data) {
      return this._writeFile(filename, JSON.stringify(data, null, 3), data);
    },
    /**
     *
     * @param {String} filename
     * @param {*} data
     * @returns {Promise}
     */
    jsonMin: function (filename, data) {
      return this._writeFile(filename, JSON.stringify(data), data);
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
          resolve(data);
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
      mkdirp(dir, function (err, dirname) {
        err ? reject(err) : resolve(dirname);
      });
    });
  },

  /**
   *
   * @param {[RegExp], RegExp} regexp
   * @param {String} string
   * @returns {boolean}
   * @private
   */
  _match: function (regexp, string) {
    if (!Array.isArray(regexp)) {
      regexp = [regexp];
    }

    for (var i = 0; regexp.length > i; i++) {
      if (regexp[i].test(string)) {
        return true;
      }
    }

    return false;
  }
};

module.exports = fileWriter;