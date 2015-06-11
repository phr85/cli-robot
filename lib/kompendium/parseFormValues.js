"use strict";

var jsdom = require("jsdom").jsdom;

/**
 *
 * @param {string} html
 * @param {{}} selectors
 * @returns {Object}
 */
function parseFormValues(html, formElements) {
  var domFeatures = {FetchExternalResources: false, ProcessExternalResources: false};
  var document = jsdom(html, domFeatures);
  var selector, el, form = {};

  for (el in formElements) {
    if (formElements.hasOwnProperty(el)) {
      selector = formElements[el];
      form[el] = document.querySelector(selector);
    }
  }

  for (el in form) {
    if (form[el] && form[el].value) {
      form[el] = form[el].value;
    } else {
      throw new Error("parseFormValues - Unable to parse values for POST-Request");
    }
  }

  return form;
}

module.exports = parseFormValues;