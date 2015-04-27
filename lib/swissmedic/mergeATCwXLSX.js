"use strict";

/**
 *
 * @param {Object} atcData
 * @param {Object} xlsxData
 * @returns {Object}
 */
function mergeATCwXLSX(atcData, xlsxData) {
  if(atcData[xlsxData.zulassung]) {
    if(atcData[xlsxData.zulassung].atcOriginal == xlsxData.atc) {
      xlsxData.atc = atcData[xlsxData.zulassung].atcKorrektur;
    }
  }
  return xlsxData;
}

module.exports = mergeATCwXLSX;