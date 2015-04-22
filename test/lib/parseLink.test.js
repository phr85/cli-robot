"use strict";

var fs = require("fs");
var path = require("path");

var expect = require('chai').expect;

describe("parseLinks", function () {
  var parseLink, url, html, regex, ref;

  before(function () {
    parseLink = require("../../lib/parseLink");
    url = "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html"
    html = fs.readFileSync(path.resolve(__dirname, "../fixtures/www.swissmedic.ch.html"), {encoding: "utf8"});
    ref = url + "?lang=de&download=NHzLpZeg7t,lnp6I0NTU042l2Z6ln1acy4Zn4Z2qZpnO2Yuq2Z6gpJCDdHx7hGym162epYbg2c_JjKbNoKSn6A--";
  });

  beforeEach(function () {
    regex = /href="([\/a-zäöü0-9\?\;\,\=\.\-\_\&]*)".*Excel-Version Zugelassene Verpackungen/i;
  });

  it("should parse link out of given html correctly", function () {
    expect(parseLink(url, html, regex)).to.equal(ref);
  });

  it("should replace '&amp;' with '&'", function () {
    expect(parseLink(url, html, regex)).to.not.contain("&amp;");
  });
});