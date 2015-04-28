"use strict";

var xlsx = require("xlsx");

/**
 *
 * @param {String} filename
 * @returns {Promise}
 */
function readXLSX(filename) {
  return new Promise(function (resolve, reject) {
    var excel = xlsx.readFile(filename);
    var worksheet;
    var parsedExcel = {};

    excel.SheetNames.forEach(function(sheet) {
      if( sheet.toUpperCase().indexOf( "ATC-CODE MIT") > -1 ) {
        worksheet = sheet;
      }
    });

    if(!worksheet) {
      return reject(new Error("ATC: No Worksheet"));
    }

    // ATC-CODES UNIQUE
    var empty = [];

    // KEIN HEADER
    for( var i = 2; i < 20000 && empty.length < 10; i++ )
    {
      var atc = excel.Sheets[ worksheet ]["A"+i];
      var name = excel.Sheets[ worksheet ]["C"+i];
      var ddd = excel.Sheets[ worksheet ]["E"+i];

      var row = {};

      empty.push("Keine Einträge");

      if( atc && atc.v.length > 0 && atc.v.length < 13) {
        row.atc = atc.v.replace(/"/g,"").trim();
      } else {
        continue;
      }

      if( name ) {
        row.name = name.v.replace(/("|\r\n)/g,"").trim();
      } else {
        continue;
      }

      if( ddd ) {
        row.ddd = ddd.v.replace(/("|\r\n)/g,"").trim();
      }

      empty = [];

      parsedExcel[ row.atc ] = { name : row.name, ddd : row.ddd };

      resolve(parsedExcel);
    }
  });
}

module.exports = readXLSX;