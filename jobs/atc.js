var fs = require("fs");
var xlsx = require('xlsx');
var async = require("async");
var download = require("../lib/download");
var log = require("../lib/util").log;
var doing = require("../lib/util").doing;

var start;
var list;

module.exports = function(done) {
  async.series([ 
    function (callback) {
      start = new Date();
      log( "ATCWIDO Querying at " + start.toISOString());
      callback(null);
    },
    function(callback) {
      log("ATCWIDO Search link at http://wido.de/amtl_atc-code.html");

      var params = {
        url: "http://wido.de/amtl_atc-code.html",
        match: /href="(.*atc.*\.zip)"/gim,
        method: "GET"
      };
      download.link( params, function( urls ) {  
        // NEWEST LINK IS LAST IN THE LIST
        link = urls.pop();
        callback(null);
      });
    },
    function(callback) {
      log( "ATCWIDO Download file and save to data/auto/atc.xlsx" );

      var save = {
        directory: "data/auto",
        filename:"atc.zip",
        url: link
      };
      download.file( save, function( filename ) {
        callback(null);
      });
      
    },
    function(callback) {
      log( "ATCWIDO Transform and Release JSON" );
    
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
      log( "ATCWIDO Release csv" );
    
      var csv = fs.createWriteStream("./data/release/atc/atc.csv");
      
      csv.on("finish", function() {
        callback(null);
      });
      
      csv.on("error", function(err) {
        log("ATC ERROR "+err.message);
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
      var duration = parseInt( (Date.now() - start.getTime()) / 1000);
      log("ATCWIDO Finished in",duration+"s" );
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


