"use strict";

var fs = require("fs");
var path = require("path");

module.exports = [{
  pattern: "https://do-request.success",

  fixtures: function () {
    var res = {text: "<html><head></head><body></body></html>"};

    return {
      res: res,
      status: 200,
      statusCode: 200,
      statusType: 2,
      text: res.text,
    };
  },

  callback: function (match, res) {
    return res;
  }
}, {
  pattern: "https://fetch-server-file-size.success",

  fixtures: function () {
    var res = {headers: {}};

    res.headers["content-length"] = "123456";
    res.text = "<html><head></head><bod><a href='link/to/file.ext'>Download</a></bod></html>";

    return {
      res: res,
      status: 200,
      statusCode: 200,
      statusType: 2,
      text: res.text
    };
  },

  callback: function (match, res) {
    return res;
  }

}, {

  pattern: "https://fetch.html.success.test",

  fixtures: function () {
    var html = fs.readFileSync(path.resolve(__dirname, "../../fixtures/html/swissmedic.html"), {encoding: "utf8"});
    return html;
  },

  callback: function (match, html) {
    var res = {
      text: html,
      res: {
        text: html
      }
    };

    return res;
  }

}];