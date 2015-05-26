"use strict";

function createATCCH(atcDEwAllModifications, swissmedicData) {
  var atcCH = {};
  var atcSwissmedic = {};

  swissmedicData.forEach(function(packung) {
    if(!packung.atc) {
      return;
    }
    atcSwissmedic[packung.atc] = true;
  });

  Object.keys(atcDEwAllModifications).forEach( function(code) {
    if(atcSwissmedic[code]){
      // All codes above
      for( var i = 1; i < code.length; i++) {
        atcCH[code.substr(0,i)] = atcDEwAllModifications[code.substr(0,i)];
      }
      atcCH[code] = atcDEwAllModifications[code];
    }
  });

  return atcCH;
}

module.exports = createATCCH;