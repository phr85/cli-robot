"use strict";

/**
 *
 * @param {Object} atcDEwModifiedNames
 * @returns {Object}
 */
function removeEmptyStrings(atcDEwModifiedNames) {
  Object.keys(atcDEwModifiedNames).forEach(function(key) {
    atcDEwModifiedNames[key].name = atcDEwModifiedNames[key].name.trim();

    if(atcDEwModifiedNames[key].ddd) {
      atcDEwModifiedNames[key].ddd = atcDEwModifiedNames[key].ddd.trim();
    }
    if(!atcDEwModifiedNames[key].ddd ){
      atcDEwModifiedNames[key].ddd = undefined;
    }
  });

  return atcDEwModifiedNames;
}

module.exports = removeEmptyStrings;