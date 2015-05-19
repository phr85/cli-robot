"use strict";

module.exports = [{

  pattern: "https://fetch-server-file-size.success",

  fixtures: function () {
    var res = {headers: {}};

    res.headers["content-length"] = "123456";
    res.text = "<html><head></head><bod><a href=\"link/to/file.ext\">Download</a></bod></html>";

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

}];