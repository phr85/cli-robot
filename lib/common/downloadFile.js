"use strict";

var request = require("request");

var disk = require("./disk");

/**
 *
 * @type {request|null}
 * @private
 */
var _agent = null;

/**
 *
 * @param {String} link
 * @param {String} dest - Destination for given download
 * @param {function({percentage: Number})} progressRenderer
 * @returns {Promise}
 */
function downloadFile(link, dest, progressRenderer) {
  return new Promise(function (resolve, reject) {
    var agent = _agent || request;

    agent
      .get(link)
      .on("response", function (res) {
        disk.write
          .stream(dest, res, progressRenderer)
          .then(function () {
            resolve({agent: agent, req: res.req, res: res});
          })
          .catch(reject);
      })
      .on("error", reject);

    _agent = null;
  });
}

/**
 *
 * @param {null|request} agent
 * @returns {downloadFile}
 */
downloadFile.setAgent = function (agent) {
  _agent = agent;
  return downloadFile;
};

module.exports = downloadFile;