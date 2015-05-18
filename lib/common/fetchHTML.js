"use strict";

var request = require("superagent");

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
    var agent = _agent || request;
    var req =   agent.get(url);

    req.end(function (err, res) {
      if (err) {
        return reject(err);
      }

      resolve({html: res.text, req: req, res: res, agent: agent});
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