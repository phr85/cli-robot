var readline = require("readline");
var events = require("events");
var async = require('async');

var io = readline.createInterface(process.stdin, process.stdout);

function robot() {
  events.EventEmitter.call( this );
  
  io.setPrompt( "> " );  
  io.on("line", this.parse.bind(this) );
  io.on("close", this.close.bind(this) );

  this.jobs = [];
  
  return this;
};

require("util").inherits( robot, events.EventEmitter );

robot.prototype.waiting = function() { 
  this.emit("waiting");
  io.prompt();
};

robot.prototype.parse = function( text ) {  
  if( !text ) return io.prompt();
  
  var tokens = text.trim().split(/\s+/);
  
  if( tokens[0] == "help" ) return this.emit( "help" );

  if( tokens[0] == "go" ) return async.series( this.jobs, this.done.bind(this) );

  this.emit("job", tokens );
};

robot.prototype.done = function() {
  this.emit("done"); 
  io.prompt();
};

robot.prototype.close = function() {
  this.emit("close"); 
  process.exit(0);
};

module.exports = new robot();
