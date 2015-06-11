"use strict";

var urlResolve = require("url").resolve;

var parseFormValues = require("./parseFormValues");

/**
 *
 * @param {string} url
 * @param {{agent: request, req: OutgoingMessage, res: IncomingMessage, html: string}} result - result-Object from .fetchHTML()
 * @returns {Promise}
 */
function acceptTermsOfUse(url, result) {
  return new Promise(function (resolve, reject) {
    var opts = { form: parseFormValues(result.html, acceptTermsOfUse.formElements) };

    url = urlResolve(url, result.req.path);

    result.agent.post(url, opts, function (err, res, body) {
      if (err) {
        reject(err);
        return;
      }

      resolve({agent: result.agent, req: res.req, res: res, html: body});
    });
  });
}

acceptTermsOfUse.formElements = {
  "__VIEWSTATE": "#__VIEWSTATE",
  "__VIEWSTATEGENERATOR": "#__VIEWSTATEGENERATOR",
  "__EVENTVALIDATION": "#__EVENTVALIDATION",
  "ctl00$MainContent$btnOK": "#MainContent_btnOK"
};

module.exports = acceptTermsOfUse;