"use strict";

var jsdom = require("jsdom").jsdom;

/**
 *
 * @param {Object} result - result-Object from .fetchHTML()
 * @returns {Promise}
 */
function acceptTermsOfUse(result) {
  return new Promise(function (resolve, reject) {
    var domFeatures = {FetchExternalResources: false, ProcessExternalResources: false};
    var document = jsdom(result.html, {features: domFeatures});
    var el, form = {
      "__VIEWSTATE": document.querySelector("#__VIEWSTATE"),
      "__VIEWSTATEGENERATOR": document.querySelector("#__VIEWSTATEGENERATOR"),
      "__EVENTVALIDATION": document.querySelector("#__EVENTVALIDATION"),
      "ctl00$MainContent$btnOK": document.querySelector("#MainContent_btnOK")
    };
    var url = result.req.url;
    var req = result.agent;

    for (el in form) {
      if (form[el] && form[el].value) {
        form[el] = form[el].value;
      } else {
        return reject(new Error("acceptTermsOfUse - Unable to parse values for POST-Request"));
      }
    }

    req
      .post(url)
      .type("form")
      .send(form)
      .end(function (err, res) {
        if (err) {
          return reject(err);
        }

        resolve({html: res.text, req: req, res: res, agent: result.agent});
      });
  });
}

module.exports = acceptTermsOfUse;