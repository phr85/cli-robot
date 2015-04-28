"use strict";

/**
 *
 * @type {ATCCorrection|null}
 * @private
 */
var _atcCorrection = null;

/**
 *
 * @param {Object} xlsxData
 * @returns {Object}
 */
function correctXLSX(xlsxData) {
  if(_atcCorrection[xlsxData.zulassung]) {
    if(_atcCorrection[xlsxData.zulassung].atcOriginal == xlsxData.atc) {
      xlsxData.atc = _atcCorrection[xlsxData.zulassung].atcKorrektur;
    }
  }
  return xlsxData;
}

/**
 *
 * @param {ATCCorrection} atcCorrection
 * @returns {correctXLSX}
 */
correctXLSX.setATCCorrection = function (atcCorrection) {
  _atcCorrection = atcCorrection;
  return correctXLSX;
};

module.exports = correctXLSX;