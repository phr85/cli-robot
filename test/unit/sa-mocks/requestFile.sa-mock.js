"use strict";

var http = require("http");

module.exports = [{
  pattern: "https://request.file.success",

  fixtures: function () {
    return {
      res: new http.IncomingMessage(),
      status: 200,
      statusCode: 200,
      statusType: 2,
      text: undefined,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  },

  callback: function (match, res) {
    return res;
  }
}];