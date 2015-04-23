"use strict";

var request = require("superagent");
var fs = require("fs");

/**
 *
 * @param {String} link
 * @param {String} dest - Destination for given download
 * @returns {Promise}
 */
function downloadFile(link, dest) {
  return new Promise(function (resolve, reject) {
    var req = request.get(link);
    var writeStream = fs.createWriteStream(dest, { encoding: "utf8" });

    req.on("end", resolve);
    req.on("error", function (err) {
      reject(err);
    });
    req.pipe(writeStream);
  });
}

module.exports = downloadFile;