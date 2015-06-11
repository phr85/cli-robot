"use strict";

var request = require("request");

var fetchHTML = require("../../common/fetchHTML");

var parseFormValues = require("../parseFormValues");
var acceptTermsOfUse = require("../acceptTermsOfUse");
var startDownload = require("../startDownload");

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
        var req, opts = { form: parseFormValues(result.html, startDownload.formElements) };

        req = result.agent.post(downloadUrl, opts)
          .on("response", function (res) {
            req.abort();
            resolve({size: parseInt(res.headers["content-length"], 10)});
          })
          .on("error", reject);
      })
      .catch(reject);
  });
}

module.exports = fetchKompendiumServerFileSize;