"use strict";

/**
 *
 * @param {Object} atcCorrection - Correction from atc.xlsx
 * @param {Object} xlsxData
 * @returns {Object}
 */
function correctXLSX(atcCorrection, xlsxData) {
  if(atcCorrection[xlsxData.zulassung]) {
    if(atcCorrection[xlsxData.zulassung].atcOriginal == xlsxData.atc) {
      atcCorrection.atc = atcCorrection[xlsxData.zulassung].atcKorrektur;
    }
  }
  return xlsxData;
}

module.exports = correctXLSX;