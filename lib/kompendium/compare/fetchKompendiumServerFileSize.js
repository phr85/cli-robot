"use strict";

var request = require("request");

var fetchHTML = require("../../common/fetchHTML");

var parseFormValues = require("../parseFormValues");
var acceptTermsOfUse = require("../acceptTermsOfUse");

/**
 *
 * @param {String} downloadUrl
 * @returns {Promise}
 */
function fetchKompendiumServerFileSize(downloadUrl) {
  return new Promise(function (resolve, reject) {
    fetchHTML.setAgent(request.defaults({jar: true}))(downloadUrl)
      .then(function (result) {
        return acceptTermsOfUse(downloadUrl, result);
      })
      .then(function (result) {
        return fetchHTML.setAgent(result.agent)(downloadUrl);
      })
      .then(function (result) {
        result.agent.post(downloadUrl, { form: parseFormValues(result.html) }, function (err, res) {
          if (err) {
            reject(err);
            return;
          }

          resolve({size: parseInt(res.headers["content-length"], 10)});
        });
      })
      .catch(reject);
  });
}

module.exports = fetchKompendiumServerFileSize;