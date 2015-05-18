"use strict";

var request = require("superagent");


/**
 *
 * @type {Request|null}
 */
var _agent = null;

/**
 *
 * @type {Request|null}
 */
var _req = null;

/**
 * Note 1: This can't be wrapped within a Promise, as a stream must be consumed immediately.
 * Note 2: A set agent will be automatically reset.
 * Note 3: A set req will be also automatically reset.
 *
 * @param {string} link
 * @param {function(null|Error, {req: Request, res: IncomingMessage, agent: function}?)} onResponse
 */
function requestFile(link, onResponse) {
  var agent = _agent || request;
  var req = _req || agent.get(link);

  req.end(function (err, res) {
    if (err) {
      onResponse(err);
    } else {
      // Note: res is the wrapped superagent-response and is not streamable, while res.res is the "native" IncomingMessage.
      onResponse(null, {req: req, res: res.res, agent: agent, html: res.text});
    }

    // reset
    _agent = null;
    _req = null;
  });
}

/**
 *
 * @param {Request|null} agent
 * @returns {downloadFile}
 */
requestFile.setAgent = function (agent) {
  _agent = agent;
  return requestFile;
};

/**
 * Note: .end() must not be called on given req yet.
 *
 * @param {Request|null} req
 * @returns {requestFile}
 */
requestFile.setPreparedReq = function (req) {
  _req = req;
  return requestFile;
};

module.exports = requestFile;