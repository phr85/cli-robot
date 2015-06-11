"use strict";

var disk = require("../common/disk");
var parseFormValues = require("./parseFormValues");

/**
 *
 * @param {string} url
 * @param {String} dest
 * @param {{agent: request, req: OutgoingMessage, res: IncomingMessage, html: string}} result
 * @param {function({percentage: Number})?} renderDownloadStatus
 * @returns {Promise}
 */
function startDownload(url, dest, result, renderDownloadStatus) {
  return new Promise(function (resolve, reject) {
    var _res;

    result.agent.post(url, { form: parseFormValues(result.html, startDownload.formElements), encoding: null})
      .on("response", function (res) {
        _res = res;

        disk.write
          .stream(dest, res, renderDownloadStatus)
          .then(function () {
            resolve({agent: result.agent, req: res.req, res: res});
          })
          .catch(reject);
      })
      .on("error", function (err) {
        // This is a workaround and it is only necessary for Kompendium
        if (err.code === "HPE_INVALID_CONSTANT") {
          resolve({agent: result.agent, req: _res.req, res: _res});
        } else {
          reject(err);
        }
      });
  });
}

startDownload.formElements = {
  "__VIEWSTATE": "#__VIEWSTATE",
  "__VIEWSTATEGENERATOR": "#__VIEWSTATEGENERATOR",
  "__EVENTVALIDATION": "#__EVENTVALIDATION",
  "ctl00$MainContent$BtnYes": "#MainContent_BtnYes"
};

module.exports = startDownload;