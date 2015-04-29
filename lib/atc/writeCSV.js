"use strict";

var fs = require("fs");

/**
 *
 * @param {String} filename
 * @param {Object} atcDE
 * @returns {Promise}
 */
function writeCSV(filename, atcDE) {
  return new Promise(function (resolve, reject) {
    var writeStream = fs.createWriteStream(filename);

    writeStream.on("finish", resolve);
    writeStream.on("error", reject);

    Object.keys(atcDE).forEach( function( code ) {
      writeStream.write( '"'+code+'","'+atcDE[code].name+'","'+atcDE[code].ddd+'"\n');
    });

    writeStream.end();
  });
}

module.exports = writeCSV;