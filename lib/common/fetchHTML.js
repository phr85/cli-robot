"use strict";

var request = require("request");

/**
 *
 * @type {null|request}
 * @private
 */
var _agent = null;

/**
 *
 * @param {String} url
 * @returns {Promise}
 */
function fetchHTML(url) {
  return new Promise(function(resolve, reject) {
    var agent = _agent || request;

    agent(url, function (err, res, body) {
      if (err) {
        reject(err);
        return;
      }

      resolve({agent: agent, req: res.req, res: res, html: body});
    });

    _agent = null;
  });
}

/**
 *
 * @param {null|request} agent
 * @returns {fetchHTML}
 */
fetchHTML.setAgent = function (agent) {
  _agent = agent;
  return fetchHTML;
};

module.exports = fetchHTML;