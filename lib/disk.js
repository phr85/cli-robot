"use strict";

var fs = require("fs");
var zlib = require("zlib");

var unzip = require("unzip");
var AdmZip = require("adm-zip");
var parseCSV = require("csv-parse");
var mkdirp = require("mkdirp");
var streamifier = require("streamifier");
var progress = require('progress-stream');

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
   * @param {[{name: RegExp, dest: String}]} zipFiles - file(s) which should be unzipped
   * @param {function(progress)} renderProgress
   * @returns {Promise}
   */
  unzip: function (zipname, zipFiles, renderProgress) {
    var self = this;

    return new Promise(function (resolve, reject) {
      var zip = new AdmZip(zipname);
      var entries = zip.getEntries();
      var p = [];

      entries.forEach(function (entry) {
        var dest = self._match(zipFiles, entry.name);

        if (dest === null) {
          return;
        } else {
          p.push(new Promise(function (_resolve, _reject) {
            entry.getCompressedDataAsync(function (buffer) {
              var readStream = streamifier.createReadStream(buffer);
              var inflateStream = zlib.createInflateRaw();
              var writeStream = fs.createWriteStream(dest);
              var progressStream = progress({length: buffer.length});

              readStream.on("error", _reject);

              inflateStream.on("error", _reject);

              writeStream.on("finish", _resolve);
              writeStream.on("error", _reject);

              if (renderProgress) {
                progressStream.on("progress", renderProgress);
              }

              readStream.pipe(inflateStream).pipe(progressStream).pipe(writeStream);
            });
          }));
        }
      });

      return Promise.all(p).then(resolve).catch(reject);
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
     * @param {string} filename
     * @param {ReadStream} readableStream
     * @param {function({percentage: Number})?}onProgress
     * @returns {Promise}
     */
    stream: function(filename, readableStream, onProgress) {
      return new Promise(function (resolve, reject) {
        var writeStream = fs.createWriteStream(filename);
        var contentLength = (!!readableStream.headers) ? readableStream.headers["content-length"] : false
        var progressStreamOpts = {};
        var progressStream;

        readableStream.on("error", reject);
        writeStream.on("finish", resolve);

        if (contentLength) {
          progressStreamOpts.length = contentLength;
        }

        if (onProgress) {
          progressStream = progress(progressStreamOpts);
          progressStream.on("progress", onProgress);
          readableStream.pipe(progressStream).pipe(writeStream);
          return;
        }

        readableStream.pipe(writeStream);
      });
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
   * @param {[{name: RegExp, dest: String}]} zipFiles
   * @param {String} path
   * @returns {String|null} - destination if name matches given path
   * @private
   */
  _match: function (zipFiles, path) {
    var i, zipFile;

    for (i = 0; zipFiles.length > i; i++) {
      zipFile = zipFiles[i];
      if (zipFile.name.test(path)) {
        return zipFile.dest;
      }
    }

    return null;
  }
};

module.exports = fileWriter;