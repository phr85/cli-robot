"use strict";

var request = require("superagent");
var fs = require("fs");

/**
 *
 * @type {Request|null}
 */
var _agent = null;

/**
 *
 * @param {String} link
 * @param {String} dest - Destination for given download
 * @returns {Promise}
 */
function downloadFile(link, dest) {
  return new Promise(function (resolve, reject) {
    var agent = _agent || request;
    var req = agent.get(link);
    var writeStream = fs.createWriteStream(dest, { encoding: "utf8" });

    req.on("end", function () {
      resolve({agent: agent});
    });
    req.on("error", reject);
    req.pipe(writeStream);
  });
}

/**
 *
 * @param {Request|null} agent
 * @returns {downloadFile}
 */
downloadFile.setAgent = function (agent) {
  _agent = agent;
  return downloadFile;
};

module.exports = downloadFile;