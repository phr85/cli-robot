"use strict";

var EventEmitter = require("events").EventEmitter;
var util = require("util");

var sinon = require("sinon");

/**
 *
 * @returns {EventEmitter}
 * @private
 */
function _createRequest(err, res) {
  var req = new EventEmitter();

  req.pipe = sinon.spy();

  req.send = function () {
    return req;
  };

  req.end = function (cb) {
    cb(err, res);
    return req;
  };

  return req;
}

/**
 *
 * @param {null|Error} err
 * @param {null|Error} res
 * @returns {{get: Function, post: Function}}
 */
function agent(err, res) {
  var req = _createRequest(err, res);

  return {
    req: req,
    get: function () {
      return this.req;
    },
    post: function () {
      return this.req;
    }
  };
}

module.exports = agent;