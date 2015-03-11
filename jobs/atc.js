var fs = require("fs");
var xlsx = require('xlsx');
var async = require("async");
var log = require("epha-log");
var download = require("../lib/download");
var list;

module.exports = function(done) {
  log.service = require("../config").service;
  log.level = require("../config").level;
  log.task = "ATC";
  
  async.series([ 
    function(callback) {
      log.info("Search link at http://wido.de/amtl_atc-code.html");
      log.time("TOTAL");
      var params = {
        url: "http://wido.de/amtl_atc-code.html",
        match: /href="(.*atc.*\.zip)"/gim,
        method: "GET"
      };
      log.time("Searched link");
      download.link( params, function( urls ) {  
        // NEWEST LINK IS LAST IN THE LIST
        link = urls.pop();
        log.timeEnd("Searched link");
        callback(null);
      });
    },
    function(callback) {
      log.info("Download file and save to data/auto/atc.xlsx");

      var save = {
        directory: "data/auto",
        filename:"atc.zip",
        url: link
      };
      log.time("Download");
      download.file( save, function( filename ) {
        log.timeEnd("Download");
        callback(null);
      });
      
    },
    function(callback) {
      log.info("Transform and Release JSON");
    
      xlsxToJson( "data/auto/atc.xlsx", function( rows )
      {
        list = rows;
        
        if( !fs.existsSync( "./data/release" ) ) fs.mkdirSync( "./data/release" );
        if( !fs.existsSync( "./data/release/atc" ) ) fs.mkdirSync( "./data/release/atc" );

        fs.writeFileSync( "./data/release/atc/atc.json", JSON.stringify( rows, null, 3 ) ); 
        fs.writeFileSync( "./data/release/atc/atc.min.json", JSON.stringify( rows ) ); 
        
        callback(null);
      });
    },
    function(callback) {
      log.info( "Release csv" );
    
      var csv = fs.createWriteStream("./data/release/atc/atc.csv");
      
      csv.on("finish", function() {
        callback(null);
      });
      
      csv.on("error", function(err) {
        log.error(err.message);
        callback(null);
      });
      
      Object.keys(list).forEach( function( item ) {
        var atc = item;
        var name = list[ item ].name;
        var ddd = list[ item ].ddd || "";
        
        csv.write( '"'+atc+'","'+name+'","'+ddd+'"\n');
      });
      
      csv.end();
      
    },
    function() {
      log.timeEnd("TOTAL");
      done(null);    
    }
  ]);
};
    
// ACTUAL WORKERS
var link;
      
// WIDO ATC
function xlsxToJson( filename, callback )
{
  var excel = xlsx.readFile(filename);

  var worksheet;
  
  excel.SheetNames.forEach(function(sheet) {
    if( sheet.toUpperCase().indexOf( "ATC-CODE MIT") > -1 )
    worksheet = sheet;  
  });
  
  if(!worksheet) throw new Error("Worksheet konnte nicht gefunden werden");

  // ATC-CODES UNIQUE
  var cleaned = {};
  var empty = [];
  
  // KEIN HEADER
  for( var i = 2; i < 20000 && empty.length < 10; i++ )
  {
    var atc = excel.Sheets[ worksheet ]["A"+i];
    var name = excel.Sheets[ worksheet ]["C"+i];
    var ddd = excel.Sheets[ worksheet ]["E"+i];

    var row = {};

    empty.push("Read new line");

    if( atc && atc.v.length > 0 && atc.v.length < 13) row.atc = atc.v.replace(/"/g,"").trim();
    else continue;

    if( name ) row.name = name.v.replace(/("|\n)/g,"").trim();
    else continue;

    if( ddd ) row.ddd = ddd.v.replace(/("|\n)/g,"").trim();

    empty = [];
    
    // KORREKTUREN
    if( row.atc == "G03AA17" && row.name == "Dienogest und Ethinylestradiol") row.atc = "G03AA16";

    cleaned[ row.atc ] = { name : row.name, ddd : row.ddd };
  }
  // MISSING
  if( !cleaned[ "N06DX02" ] ) cleaned[ "N06DX02" ] = { name : "Ginkgo folium", ddd : "0.12 g O" };
  if( !cleaned[ "N04BA02" ] ) cleaned[ "N04BA02" ] = { name : "Levodopa und Decarboxylasehemmer", ddd : "0.6 g O" };

  callback( cleaned );
};


