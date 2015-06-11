"use strict";

var jsdom = require("jsdom").jsdom;

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
    result.agent.post(url, { form: parseFormValues(result.html, startDownload.formElements) })
      .on("response", function (res) {
        disk.write
          .stream(dest, res, renderDownloadStatus)
          .then(function () {
            resolve({agent: result.agent, req: res.req, res: res});
          })
          .catch(reject);
      })
      .on("error", reject);
  });
}

startDownload.formElements = {
  "__VIEWSTATE": "#__VIEWSTATE",
  "__VIEWSTATEGENERATOR": "#__VIEWSTATEGENERATOR",
  "__EVENTVALIDATION": "#__EVENTVALIDATION",
  "ctl00$MainContent$BtnYes": "#MainContent_BtnYes"
};

module.exports = startDownload;