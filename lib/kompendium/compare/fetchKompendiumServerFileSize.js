"use strict";

var request = require("superagent");

var fetchHTML = require("../../common/fetchHTML");
var doRequest = require("../../common/doRequest");
var acceptTermsOfUse = require("../acceptTermsOfUse");
var prepareDownload = require("../prepareDownload");

/**
 *
 * @param {String} downloadUrl
 * @returns {Promise}
 */
function fetchKompendiumServerFileSize(downloadUrl) {
  return new Promise(function (resolve, reject) {
    fetchHTML.setAgent(request.agent())(downloadUrl)
      .then(function (result) {
        return acceptTermsOfUse(result);
      })
      .then(function (result) {
        return fetchHTML(result.req.url);
      })
      .then(function (result) {
        return prepareDownload(result);
      })
      .then(function (preparedRequest) {
        doRequest.setPreparedReq(preparedRequest)(null, function (err, result) {
          if (err) {
            return reject(err);
          }

          resolve({size: parseInt(result.res.headers["content-length"], 10)});
        });
      })
      .catch(reject);
  });
}

module.exports = fetchKompendiumServerFileSize;