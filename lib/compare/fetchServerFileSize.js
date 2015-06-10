"use strict";

var fetchHTML = require("../common/fetchHTML");
var parseLink = require("../common/parseLink");
var doRequest = require("../common/doRequest");

function fetchServerFileSize(url, linkParser) {
  return new Promise(function (resolve, reject) {
    fetchHTML(url)
      .then(function (result) {
        return parseLink(result.req.url, result.html, linkParser);
      })
      .then(function (parsedLink) {
        doRequest(parsedLink, function (err, result) {
          if (err) {
            return reject(err);
          }

          resolve({size: parseInt(result.res.headers["content-length"], 10)});
        });
      });
  });
}

module.exports = fetchServerFileSize;