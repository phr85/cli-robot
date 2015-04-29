"use strict";

var fs = require("fs");
var path = require("path");

var expect = require('chai').expect;

describe("parseLinks", function () {
  var parseLink, url, html, regex, ref;

  before(function () {
    parseLink = require("../../lib/parseLink");
  });

  describe("swissmedic", function () {
    before(function () {
      url = "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html";
      html = fs.readFileSync(path.resolve(__dirname, "../fixtures/www.swissmedic.ch.html"), {encoding: "utf8"});
      ref = url + "?lang=de&download=NHzLpZeg7t,lnp6I0NTU042l2Z6ln1acy4Zn4Z2qZpnO2Yuq2Z6gpJCDdHx7hGym162epYbg2c_JjKbNoKSn6A--";
    });

    beforeEach(function () {
      regex = /href="([\/a-zäöü0-9\?\;\,\=\.\-\_\&]*)".*Excel-Version Zugelassene Verpackungen/ig;
    });

    it("should parse link out of given html correctly", function () {
      expect(parseLink(url, html, regex)).to.equal(ref);
    });

    // @TODO move to a more generic test
    it("should replace '&amp;' with '&'", function () {
      expect(parseLink(url, html, regex)).to.not.contain("&amp;");
    });
  });

  describe("atc", function () {
    before(function () {
      url = "http://www.wido.de/amtl_atc-code.html";
      html = fs.readFileSync(path.resolve(__dirname, "../fixtures/amtl_atc-code.html"), {encoding: "utf8"});
      ref = "http://www.wido.de/fileadmin/wido/downloads/pdf_arzneimittel/atc/wido_arz_amtl_atc-index_1214.zip";
    });

    beforeEach(function () {
      regex = /href="(.*atc.*\.zip)"/img;
    });

    it("should parse link out of given html correctly", function () {
      expect(parseLink(url, html, regex)).to.equal(ref);
    });
  });
});