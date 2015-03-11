#!/usr/bin/env node

// CALL QUEUE
var emil = require('../lib').emil;

// AVAILABLE JOBS
var bag = require('../jobs/bag');
var atc = require('../jobs/atc');
var swissmedic = require('../jobs/swissmedic');
var kompendium = require('../jobs/kompendium');


// WAITING FOR USER INPUT
emil.on("waiting", function()
{
  if( emil.jobs.length == 0 )
  console.log("EMIL: I'm ready, if you are? Type help for help.");
  
  if( emil.jobs.length > 0 )
  console.log("EMIL: You can run queue with 'go'");
});

// PARSE USER INPUT
emil.on("job", function( tokens )
{
  if( tokens[0] == "bag" ) {
    this.jobs.push( bag );
    console.log( "EMIL: Added 'bag' to the queue (%d jobs)!", this.jobs.length);
  }  
  if( tokens[0] == "swissmedic" ) {
    this.jobs.push( swissmedic );
    console.log( "EMIL: Added 'swissmedic' to the queue (%d jobs)!", this.jobs.length);
  }
  if( tokens[0] == "atc" ) {
    this.jobs.push( atc );
    console.log( "EMIL: Added 'atc' to the queue (%d jobs)!", this.jobs.length);
  }
  if( tokens[0] == "kompendium" ) {
    this.jobs.push( kompendium );
    console.log( "EMIL: Added 'kompendium' to the queue (%d jobs)!", this.jobs.length);
  }
  
  emil.waiting();
});

// USER REQUESTED HELP
emil.on("help", function( tokens )
{
  console.log( "EMIL: You can add jobs to the queue e.g." );
  console.log( "EMIL: 'atc' << Codes & DDD" );
  console.log( "EMIL: 'bag' << Spezialitätenliste" );
  console.log( "EMIL: 'kompendium' << Swissmedic Kompendium" );
  console.log( "EMIL: 'swissmedic' << Registered products CH" );
  console.log( "EMIL: and then run queue with 'go'");

  emil.waiting();
});

// QUEUE DONE
emil.on("done", function()
{
  emil.jobs = [];
  console.log("EMIL: I did everthing you asked for!");
  emil.waiting();
});

// USER PRESSED CONTROL C
emil.on("close", function()
{
  console.log("");
  console.log("EMIL: You want to quit, I quit!"); 
});

emil.waiting();
