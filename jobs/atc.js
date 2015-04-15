var fs = require("fs");
var xlsx = require('xlsx');
var async = require("async");
var log = require("../lib").log;
var download = require("../lib/download");

var list_de;
var list_de_ch;

module.exports = function(done) {

  async.series([
    function(callback) {
      log.info("ATC", "Get, Load and Parse");
      log.time("ATC", "Completed in");
      callback(null);
    },
    function(callback) {
      log.debug("ATC", "Search Link", { url:"wido.de" });
      var params = {
        url: "http://wido.de/amtl_atc-code.html",
        match: /href="(.*atc.*\.zip)"/gim,
        method: "GET"
      };
      log.time("ATC", "Search Download");
      download.link( params, function( urls ) {
        // NEWEST LINK IS LAST IN THE LIST
        link = urls.pop();
        log.timeEnd("ATC", "Search Download");
        callback(null);
      });
    },
    function(callback) {
      log.debug("ATC", "Download File", {name:"atc.xlsx"});

      var save = {
        directory: "data/auto",
        filename:"atc.zip",
        url: link
      };
      log.time("ATC", "Download File in");
      download.file( save, function( filename ) {
        log.timeEnd("ATC", "Download File in");
        callback(null);
      });

    },
    function(callback) {
      log.debug("ATC", "Transform xlxs To JSON");

      // PARSE AND CORRECT
      xlsxToJson( "data/auto/atc.xlsx", function( rows )
      {
        list_de = rows.de;
        list_de_ch = rows.de_ch;

        if( !fs.existsSync( "./data/release" ) ) fs.mkdirSync( "./data/release" );
        if( !fs.existsSync( "./data/release/atc" ) ) fs.mkdirSync( "./data/release/atc" );

        fs.writeFileSync( "./data/release/atc/atc.json", JSON.stringify( list_de, null, 3 ) );
        fs.writeFileSync( "./data/release/atc/atc.min.json", JSON.stringify( list_de ) );
        
        fs.writeFileSync( "./data/release/atc/atc_de-ch.json", JSON.stringify( list_de_ch, null, 3 ) );
        fs.writeFileSync( "./data/release/atc/atc_de-ch.min.json", JSON.stringify( list_de_ch ) );

        log.debug("ATC", "Transform Written to Files");
        callback(null);
      });
    },
    function(callback) {
      log.debug("ATC", "Release csv" );

      var csv = fs.createWriteStream("./data/release/atc/atc.csv");

      csv.on("finish", function() {
        callback(null);
      });

      csv.on("error", function(err) {
        log.error("ATC", err.message, err.stack);
        callback(null);
      });

      Object.keys(list_de).forEach( function( item ) {
        var atc = item;
        var name = list_de[ item ].name;
        var ddd = list_de[ item ].ddd || "";

        csv.write( '"'+atc+'","'+name+'","'+ddd+'"\n');
      });

      csv.end();

    },
    function() {
      log.timeEnd("ATC", "Completed in");
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
  var swissmedic = require("../data/release/swissmedic/swissmedic.json"); 
      
  var worksheet;

  excel.SheetNames.forEach(function(sheet) {
    if( sheet.toUpperCase().indexOf( "ATC-CODE MIT") > -1 )
    worksheet = sheet;
  });

  if(!worksheet) {
    log.error("ATC","No Worksheet");
    callback(null);
  }
  if(!swissmedic) {
    log.error("ATC","Please load swissmedic first");
    callback(null);
  }

  // ATC-CODES UNIQUE
  var de = {};
  var de_ch = {};
  
  var ch_packungen = {};
  var empty = [];
  
  swissmedic.forEach( function(packung) {
    if(!packung.atc) {
      return;
    }
    ch_packungen[packung.atc] = true;
  });

  // KEIN HEADER
  for( var i = 2; i < 20000 && empty.length < 10; i++ )
  {
    var atc = excel.Sheets[ worksheet ]["A"+i];
    var name = excel.Sheets[ worksheet ]["C"+i];
    var ddd = excel.Sheets[ worksheet ]["E"+i];

    var row = {};
    
    empty.push("Keine Einträge");

    if( atc && atc.v.length > 0 && atc.v.length < 13) row.atc = atc.v.replace(/"/g,"").trim();
    else continue;

    if( name ) row.name = name.v.replace(/("|\n)/g,"").trim();
    else continue;

    if( ddd ) row.ddd = ddd.v.replace(/("|\n)/g,"").trim();

    empty = [];
    
    de[ row.atc ] = { name : row.name, ddd : row.ddd };
    
    if( ch_packungen[row.atc] ) {
      de_ch[row.atc] = { name : row.name, ddd : row.ddd };
    }
  }
  
  

  callback({ de:de, de_ch: de_ch });
}

  var parse = require("csv-parse");
  
  var add = fs.readFileSync("./data/manual/produkte/master.csv");
  parse(csv, function(err,data) {
  
    if( err) console.log(err);
    if(!err) transform(data, done);
  });
