"use strict";

var readline = require("readline");
var EventEmitter = require("events").EventEmitter;

var io = readline.createInterface(process.stdin, process.stdout);

function Robot() {
  EventEmitter.call(this);
  
  io.setPrompt( "> " );  
  io.on("line", this.parse.bind(this) );
  io.on("close", this.close.bind(this) );

  this.jobs = [];
  
  return this;
}

require("util").inherits(Robot, EventEmitter);

Robot.prototype.waiting = function() {
  this.emit("waiting");
  io.prompt();
};

Robot.prototype.parse = function( text ) {
  var tokens, p;

  if( !text ) {
    io.prompt();
    return;
  }
  
  tokens = text.trim().split(/\s+/);
  
  if (tokens[0] === "help") {
    this.emit( "help" );
    return;
  }

  if (tokens[0] === "go") {
    p = new Promise(function (resolve) {
      resolve();
    });

    this.jobs.forEach(function (job) {
      p = p.then(job);
    });

    p = p.then(this.done.bind(this));
    p = p.catch(console.error);
  }

  this.emit("job", tokens );
};

Robot.prototype.done = function() {
  this.emit("done"); 
  io.prompt();
};

Robot.prototype.close = function() {
  this.emit("close"); 
  process.exit(0);
};

module.exports = new Robot();