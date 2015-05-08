"use strict";

var fs = require("fs");
var path = require("path");

var expect = require("chai").expect;

//@TODO use rewire or export cfg to require it here and use it in test
//@TODO use fixtures from test_integration to reduce repo size
describe("parseLinks", function () {
  var parseLink, url, html, regex, ref, job;

  before(function () {
    parseLink = require("../../lib/parseLink");
  });

  describe("swissmedic", function () {
    before(function () {
      job = require("../../jobs/swissmedic");
      url = "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html";
      html = fs.readFileSync(path.resolve(__dirname, "../../fixtures/html/swissmedic.html"), {encoding: "utf8"});
      ref = url + "?lang=de&download=NHzLpZeg7t,lnp6I0NTU042l2Z6ln1acy4Zn4Z2qZpnO2Yuq2Z6gpJCDdHx7hGym162epYbg2c_JjKbNoKSn6A--";
    });

    beforeEach(function () {
      regex = job.cfg.download.linkParser;
      regex.index = 0;
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
      job = require("../../jobs/atc");
      url = "http://www.wido.de/amtl_atc-code.html";
      html = fs.readFileSync(path.resolve(__dirname, "../../fixtures/html/atc.html"), {encoding: "utf8"});
      ref = "http://www.wido.de/fileadmin/wido/downloads/pdf_arzneimittel/atc/wido_arz_amtl_atc-index_1214.zip";
    });

    beforeEach(function () {
      regex = job.cfg.download.linkParser;
      regex.index = 0;
    });

    it("should parse link out of given html correctly", function () {
      expect(parseLink(url, html, regex)).to.equal(ref);
    });
  });

  describe("bag", function () {
    before(function () {
      job = require("../../jobs/bag");
      url = "http://www.spezialitaetenliste.ch/";
      html = fs.readFileSync(path.resolve(__dirname, "../../fixtures/html/bag.html"), {encoding: "utf8"});
      ref =  "http://www.spezialitaetenliste.ch/File.axd?file=XMLPublications.zip";
    });

    beforeEach(function () {
      regex = job.cfg.download.linkParser;
      regex.index = 0;
    });

    it("should parse link out of given html correctly", function () {
      expect(parseLink(url, html, regex)).to.equal(ref);
    });
  });
});