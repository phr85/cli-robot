"use strict";

var readATC = require('./readATC');
var readXLSX = require('./readXLSX');

function readATCandXLSX(atcFilename, xlsxFilename) {
  return Promise.all([readATC(atcFilename), readXLSX(xlsxFilename)])
}

module.exports = readATCandXLSX;