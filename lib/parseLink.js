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
  var links, link;

  // Parsing does work under the assumption that a RegExp without set global match was given.
  // If global match was set String.prototype.match will discard found parenthesized substring matches.
  if (regex.global) {
    throw new Error("parseLink: Can't use RegExp with 'global match' properly");
  }

  links = html.match(regex);

  // Selection does work under a further assumption: RegExp must contain parenthesized substring matchers and
  // on index 1 of matches/links searched part of link will be found.
  if (links.length === 2) {
    link = links[1];
    link = link.replace("&amp;", "&");
    link = resolveUrl(url, link);

    return link;
  }

  return null;
}

module.exports = parseLink;