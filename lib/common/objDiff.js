"use strict";

/**
 * Creates a diff of o1 to o2.
 * Note: Only simple types and not nested objects are supported.
 *
 * @param {{}} o1
 * @param {{}} o2
 * @returns {{}}
 */
function objDiff(o1, o2) {
  var key, diff = {};

  for (key in o1) {
    if (o1.hasOwnProperty(key) && o2.hasOwnProperty(key)) {
      if (o1[key] === o2[key]) {
        continue;
      }

      diff[key] = o2[key];
    }
  }

  return diff;
}

module.exports = objDiff;