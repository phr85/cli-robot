"use strict";

var log = require("../").log;

var _refresh = 0;

/**
 *
 * @param {Number} contentLength
 * @param {Number} totalLength
 */
function renderDownloadStatus(contentLength, totalLength) {
  var percent;

  if (contentLength === totalLength) {
    _refresh = 0;
  }

  if (_refresh % 100 === 0) {
    percent = (totalLength / contentLength * 100).toFixed(2);
    percent += "%";

    log.doing("Kompendium", "Downloading", percent);
  }

  _refresh++;
}

/**
 * @returns {renderDownloadStatus}
 */
renderDownloadStatus.reset = function () {
  _refresh = 0;
  return renderDownloadStatus;
};

module.exports = renderDownloadStatus;