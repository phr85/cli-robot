"use strict";

var jsdom = require("jsdom").jsdom;

/**
 *
 * @param {{}} result
 * @returns {Promise}
 */
function prepareDownload(result) {
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
    var preparedReq, agent = result.agent;

    for (el in form) {
      if (form[el] && form[el].value) {
        form[el] = form[el].value;
      } else {
        return reject(new Error("startDownload - Unable to parse values for POST-Request"));
      }
    }

    preparedReq = agent.post(url).type("form").send(form);
    resolve(preparedReq);
  });
}

module.exports = prepareDownload;