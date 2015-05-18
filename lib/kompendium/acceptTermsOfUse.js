"use strict";

var jsdom = require("jsdom").jsdom;
var requestFile = require("../common/requestFile");

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
    var agent = result.agent;
    var preparedReq;

    for (el in form) {
      if (form[el] && form[el].value) {
        form[el] = form[el].value;
      } else {
        return reject(new Error("acceptTermsOfUse - Unable to parse values for POST-Request"));
      }
    }

    preparedReq = req.post(url).type("form").send(form);
    requestFile.setAgent(agent).setPreparedReq(preparedReq)(url, function (err, result) {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

module.exports = acceptTermsOfUse;