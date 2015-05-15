"use strict";

var fs = require("fs");
var path = require("path");

module.exports = [{

  pattern: "https://fetch.html.success.test",

  fixtures: function () {
    return fs.readFileSync(path.resolve(__dirname, "../../fixtures/html/swissmedic.html"), {encoding: "utf8"});
  },

  callback: function (match, html) {
    return {
      text: html
    };
  }

}];