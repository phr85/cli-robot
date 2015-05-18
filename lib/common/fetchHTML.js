"use strict";

var request = require("superagent");

var requestFile = require("../common/requestFile");

/**
 *
 * @type {Request|null}
 */
var _agent = null;

/**
 *
 * @param {String} url
 * @returns {Promise}
 */
function fetchHTML(url) {
  return new Promise(function(resolve, reject) {
    if (_agent) {
      requestFile.setAgent(_agent);
    }

    requestFile(url, function (err, result) {
      if (err) {
        return reject(err);
      }

      resolve(result)
    });
  });
}

/**
 *
 * @param {Request} agent
 * @returns {fetchHTML}
 */
fetchHTML.setAgent = function (agent) {
  _agent = agent;
  return fetchHTML;
};

module.exports = fetchHTML;