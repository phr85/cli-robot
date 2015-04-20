'use strict';

var sinon = require('sinon');
var expect  =require('chai').expect;
var rewire = require('rewire');

describe('download', function () {
  var download, http, https;

  before(function preventLogging() {
    download = rewire('../../lib/download.js');
    download.__set__('../lib', {});

    http = rewire('http', {});
    https = require('https', {});
  });

  describe('implicit setup', function () {
    it('should create data/auto-folder in project-root when it does not exist', function () {

    });
  });

  describe('.link(params, callback)', function () {
    it('should use according to given params "http" or "https"', function () {

    });
  });

});