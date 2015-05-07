"use strict";

var jsdom = require("jsdom").jsdom;

var log = require("../").log;
var disk = require("../disk");

/**
 *
 * @param {{req: Request, res: Response, agent: Object}}result
 * @param {String} dest
 * @param {function({percentage: Number})?} renderDownloadStatus
 * @returns {Promise}
 */
function startDownload(result, dest, renderDownloadStatus) {
  return new Promise(function (resolve, reject) {
    var domFeatures = {FetchExternalResources: false, ProcessExternalResources: false};
    var document = jsdom(result.html, domFeatures);
    var el, form = {
      "__VIEWSTATE": document.querySelector("#__VIEWSTATE"),
      "__VIEWSTATEGENERATOR": document.querySelector("#__VIEWSTATEGENERATOR"),
      "__EVENTVALIDATION": document.querySelector("#__EVENTVALIDATION"),
      "ctl00$MainContent$BtnYes": document.querySelector("#MainContent_BtnYes")
    };
    var url = result.req.url;
    var req, agent = result.agent;

    for (el in form) {
      if (form[el] && form[el].value) {
        form[el] = form[el].value;
      } else {
        return reject(new Error("startDownload - Unable to parse values for POST-Request"));
      }
    }

    req = agent
      .post(url)
      .type("form")
      .send(form)
      .end(function (err, res) {
        if (err) {
          return reject(err);
        }

        disk.write
          .stream(dest, res.res, renderDownloadStatus)
          .then(function () {
            resolve({req: req, res: res, agent: result.agent});
          })
          .catch(reject);
      });
  });
}

module.exports = startDownload;