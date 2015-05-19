"use strict";

var jsdom = require("jsdom").jsdom;

var log = require("../").log;
var prepareDownload = require("./prepareDownload");
var downloadFile = require('../common/downloadFile');
var disk = require("../common/disk");

/**
 *
 * @param {{req: Request, res: Response, agent: Object}}result
 * @param {String} dest
 * @param {function({percentage: Number})?} renderDownloadStatus
 * @returns {Promise}
 */
function startDownload(result, dest, renderDownloadStatus) {
  return new Promise(function (resolve, reject) {
    prepareDownload(result)
      .then(function (preparedReq) {
        var agent = result.agent;
        var url = result.req.url;

        downloadFile.setAgent(agent).setPreparedReq(preparedReq)(url, dest, renderDownloadStatus)
          .then(function (result) {
            downloadFile.setAgent(null);
            resolve(result);
          })
          .catch(reject);
      })
      .catch(reject);
  });
}

module.exports = startDownload;