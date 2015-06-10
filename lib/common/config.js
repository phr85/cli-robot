"use strict";

var path = require("path");

var dlPath, manPath, relPath, hisPath, logPath;
var nonPathOpts = ["url", "linkParser"];

function isObject(obj) {
  return obj.constructor === Object;
}

function pathResolve(base, cfg) {
  for (var opt in cfg) {
    if (cfg.hasOwnProperty(opt)) {
      if (isObject(cfg[opt])) {
        pathResolve(base, cfg[opt]);
      }

      if (typeof cfg[opt] !== "string") {
        continue;
      }

      if (nonPathOpts.indexOf(opt) > -1) {
        continue;
      }

      cfg[opt] = path.resolve(base, cfg[opt]);
    }
  }

  cfg.dir = base;
}

function config(job, cfg, base) {

  base = base || process.cwd();

  dlPath = path.resolve(base, "./data/auto/" + job);
  manPath = path.resolve(base, "./data/manual/" + job);
  relPath = path.resolve(base, "./data/release/" + job);
  hisPath = path.resolve(base, "./data/release/" + job);
  logPath = path.resolve(base, "./logs/" + job);

  if (cfg.download) {
    pathResolve(dlPath, cfg.download);

    if (cfg.download.zipFiles) {
      cfg.download.zipFiles.forEach(function (zipFile) {
        zipFile.dest = path.resolve(dlPath, zipFile.dest);
      });
    }
  }

  if (cfg.manual) {
    pathResolve(manPath, cfg.manual);
  }

  if (cfg.release) {
    pathResolve(relPath, cfg.release);
  }

  if (cfg.history) {
    pathResolve(hisPath, cfg.history);
  }

  if (cfg.log) {
    pathResolve(logPath, cfg.log);
  }

  return cfg;
}

module.exports = config;