"use strict";

var xlsx = require("xlsx");

/**
 *
 * @param {String} filename
 * @returns {Object} - Parsed German ATC
 */
function readXLSX(filename) {
  var excel;
  var worksheet;
  var atcDE = {};

  try {
    excel = xlsx.readFile(filename);
  } catch(err) {
    throw new Error("ATC.readXLSX - Error: " + err.message);
  }

  excel.SheetNames.forEach(function(sheet) {
    if( sheet.toUpperCase().indexOf( "ATC-CODE MIT") > -1 ) {
      worksheet = sheet;
    }
  });

  if(!worksheet) {
    throw new Error("ATC.readXLSX - Error: No Worksheet");
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

    atcDE[ row.atc ] = { name : row.name, ddd : row.ddd };
  }

  return atcDE;
}

module.exports = readXLSX;