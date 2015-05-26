"use strict";

var request = require("superagent");

var doRequest = require('./doRequest');
var disk = require("./disk");

/**
 *
 * @type {Request|null}
 */
var _agent = null;

/**
 *
 * @type {Request|null}
 */
var _req = null;

/**
 *
 * @param {String} link
 * @param {String} dest - Destination for given download
 * @param {function({percentage: Number})} progressRenderer
 * @returns {Promise}
 */
function downloadFile(link, dest, progressRenderer) {
  return new Promise(function (resolve, reject) {
    if (_agent) {
      doRequest.setAgent(_agent);
    }

    if (_req) {
      doRequest.setPreparedReq(_req);
      _req = null;
    }

    doRequest(link, function (err, result) {
      if (err) {
        return reject(err);
      }

      disk
        .write
        .stream(dest, result.res, progressRenderer)
        .then(function () {
          resolve(result);
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

/**
 * Note: A prepared request can be used only once.
 *
 * @param {Request|null} agent
 * @returns {downloadFile}
 */
downloadFile.setPreparedReq = function(preparedReq) {
  _req = preparedReq;
  return downloadFile;
};

module.exports = downloadFile;