"use strict";

var disk = require("../../lib/disk");

function readATC(atcCSVFile) {
  var relevantATCFileData = {};

  return disk
    .read.csv(atcCSVFile)
    .then(function (atcCSVData) {
      atcCSVData.forEach(function (cells) {
        relevantATCFileData[cells[0]] = {
          approval: cells[0],
          atcOriginal: cells[1],
          atcKorrektur: cells[2],
          name: cells[3]
        };
      });

      return relevantATCFileData;
    });
}

module.exports = readATC;