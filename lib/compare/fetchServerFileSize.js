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
        request(parsedLink, function (err, res) {
          if (err) {
            reject(err);
            return;
          }

          resolve({size: parseInt(res.headers["content-length"], 10)});
        });
      });
  });
}

module.exports = fetchServerFileSize;