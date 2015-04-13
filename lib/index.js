var log = require("epha-log");

module.exports.log = log({
  service:require("../package.json").name,
  version:require("../package.json").version
});

exports.emil = require("./emil.js");
exports.util = require("./util.js");
exports.download = require("./download.js");

exports.atc = require("../jobs/atc");
exports.bag = require("../jobs/bag");
exports.kompendium = require("../jobs/kompendium");
exports.swissmedic = require("../jobs/swissmedic");
