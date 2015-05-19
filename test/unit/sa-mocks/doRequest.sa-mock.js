"use strict";

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
}];