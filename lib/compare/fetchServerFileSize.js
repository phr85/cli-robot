"use strict";

var request = require("request");

var fetchHTML = require("../common/fetchHTML");
var parseLink = require("../common/parseLink");

function fetchServerFileSize(url, linkParser) {
  return new Promise(function (resolve, reject) {
    fetchHTML(url)
      .then(function (result) {
        return parseLink(url, result.html, linkParser);
      })
      .then(function (parsedLink) {
        var req = request
          .get(parsedLink)
          .on("response", function (res) {
            req.abort();
            resolve({size: parseInt(res.headers["content-length"], 10)});
          })
          .on("error", reject);
      });
  });
}

module.exports = fetchServerFileSize;