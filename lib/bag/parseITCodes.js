"use strict";

var fs = require("fs");

var splitter = require("xml-splitter");

/**
 *
 * @param {String} itCodesXML
 * @returns {Promise}
 */
function parseITCodes(itCodesXML) {
  return new Promise(function (resolve, reject) {
    var xs = new splitter("/ItCodes/ItCode");

    var cleaned = [];
    
    xs.on("data", function(data) {
      cleaned.push( { code: data.Code, name: data.DescriptionDe.$t } );
    });

    xs.on("end", function () {
      resolve(cleaned);
    });
    
    xs.on("error", reject);
    
    var stream = fs.createReadStream(itCodesXML, { start:3 });

    xs.parseStream( stream );
  });
}

module.exports = parseITCodes;