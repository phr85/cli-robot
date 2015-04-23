"use strict";

var request = require("superagent");

/**
 *
 * @param {String} url
 * @returns {Promise}
 */
function fetchHTML(url) {
  return new Promise(function(resolve, reject) {
    request
      .get(url)
      .end(function (err, res) {
        if (err) {
          return reject(err);
        }

        resolve(res.text);
      });
  });
}

module.exports = fetchHTML;