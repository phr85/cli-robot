"use strict";

var request = require("superagent");

var requestFile = require('./requestFile');
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
      requestFile.setAgent(_agent);
    }

    if (_req) {
      requestFile.setPreparedReq(_req);
      _req = null;
    }

    requestFile(link, function (err, result) {
      if (err) {
        return reject(err);
      }

      disk
        .write
        .stream(dest, result.res, progressRenderer)
        .then(function () {
          resolve(result)
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