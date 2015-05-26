"use strict";

var util = require("util");

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
 *
 * @constructor
 */
function DoRequestError() {
  Error.apply(this, arguments);
}

util.inherits(DoRequestError, Error);

/**
 * Note 1: This can't be wrapped within a Promise, as a stream must be consumed immediately.
 * Note 2: A set agent will be automatically reset.
 * Note 3: A set req will be also automatically reset.
 *
 * @param {string|null} link - can pe only postponed if a prepared request was set
 * @param {function(null|Error, {req: Request, res: IncomingMessage, agent: function}?)} onResponse
 */
function doRequest(link, onResponse) {
  var agent = _agent || request;
  var req = _req || agent.get(link);

  // reset
  _agent = null;
  _req = null;

  req.end(function (err, res) {
    if (err) {
      onResponse(new DoRequestError(err.message));
    } else {
      // Note: res is the wrapped superagent-response and is not streamable, while res.res is the "native" IncomingMessage.
      onResponse(null, {req: req, res: res.res, agent: agent, html: res.text});
    }
  });
}

/**
 *
 * @param {Request|null} agent
 * @returns {downloadFile}
 */
doRequest.setAgent = function (agent) {
  _agent = agent;
  return doRequest;
};

/**
 * Note: .end() must not be called on given req yet.
 *
 * @param {Request|null} req
 * @returns {doRequest}
 */
doRequest.setPreparedReq = function (req) {
  _req = req;
  return doRequest;
};

/**
 *
 * @type {DoRequestError}
 */
doRequest.DoRequestError = DoRequestError;

module.exports = doRequest;