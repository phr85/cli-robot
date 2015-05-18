"use strict";

var request = require("superagent");

var disk = require("./disk");

/**
 *
 * @type {Request|null}
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
    var req = agent.get(link);

    req.end(function (err, res) {
      if (err) {
        return reject(err);
      }

      disk.write
        .stream(dest, res.res, progressRenderer)
        .then(function () {
          resolve({req: req, res: res, agent: agent});
        })
        .catch(reject);
    });

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