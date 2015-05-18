"use strict";

var atcCfg = require("../jobs/cfg/atc.cfg");
//var bagCfg = require();
//var kompenidumCfg = require();
//var swissmedicCfg = require();

var log = require("../lib").log;
var disk = require("../lib/common/disk");
var fetchHTML = require("../lib/common/fetchHTML");
var parseLink = require("../lib/common/parseLink");
var doRequest = require("../lib/common/doRequest");

Promise.all([
  new Promise(function (resolveATC, rejectATC) {
    log.info("ATC", "Check if " + atcCfg.download.file + " exists.");

    return disk.fileExists(atcCfg.download.file)
      .then(function (fileExists) {
        return new Promise(function (resolve) {
          if (!fileExists) {
            log.info("ATC", atcCfg.download.file + " hasn't been download yet.");
            return resolve();
          }

          log.info("ATC", "Read and fetch file stats from disk and server.");
          return Promise.all([
            disk.read.stats(atcCfg.download.file),
            new Promise(function (resolveServerRequest) {
              return fetchHTML(atcCfg.download.url)
                .then(function (result) {
                  return parseLink(atcCfg.download.url, result.html, atcCfg.download.linkParser);
                })
                .then(function (parsedLink) {
                  doRequest(parsedLink, function (err, result) {
                    if (err) {
                      log.error("ATC", "Unable to fetch file stats from server. Reason:");
                      log.error("ATC", err);
                      return rejectATC(err);
                    }

                    log.info("ATC", "Fetched file stats from server (url: " + parsedLink + ")");
                    resolveServerRequest(result.res.headers);
                  });
                });
            })
          ])
          .then(function (data) {
            var downloadedFileSize = data[0].size;
            var serverFileSize = parseInt(data[1]["content-length"], 10);

            log.info("ATC", "Comparing disk and server stats.");

            if (downloadedFileSize === serverFileSize) {
              log.info("ATC", "File on disk is up-to-date");
            } else {
              log.warn("ATC", "There is a newer file on the server");
            }

            resolveATC();
          })
          .catch(rejectATC);
        });
      })
      .catch(rejectATC);
  })
]).then(function() {
  process.exit(0);
}).catch(function (err) {
  console.error(err);
  process.exit(1); //not ok
});