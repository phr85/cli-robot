"use strict";

var resolveUrl = require('url').resolve;


/**
 *
 * @param {String} url
 * @param {String} html
 * @param {RegExp} regex
 * @returns {String|null}
 */
function parseLink(url, html, regex) {
  var links, link, lastMatchingLink, subMatches;

  links = html.match(regex);

  // Selection does work under a further assumption: RegExp must contain parenthesized substring matchers and
  // on index 1 of matches/links searched part of link will be found.
  if (Array.isArray(links)) {
    lastMatchingLink = links.length - 1; // zero based index;
    link = links[lastMatchingLink];
    // exec provides an array with submatches at index 1
    regex.lastIndex = 0;
    subMatches = regex.exec(link);
    link = subMatches[1];
    link = link.replace("&amp;", "&");
    link = resolveUrl(url, link);

    return link;
  }

  return null;
}

module.exports = parseLink;