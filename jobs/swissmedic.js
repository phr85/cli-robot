var download = require("../lib/download");

var xlsx = require('xlsx');
var util = require("../lib/util");
var fs = require("fs");
var async = require("async");
var log = require("../lib").log;
var parse = require("csv-parse");
var atcKorrekturen;

module.exports = function(done) {

  async.series([ 
    function(callback) {
      log.info("Swissmedic", "Get, Load and Parse");
      log.time("Swissmedic", "Completed in");
      callback(null);
    },
    function(callback) {  
      log.debug("Swissmedic", "Search link", {url:"https://www.swissmedic.ch/"});
      log.time("TOTAL");

      var find = {
        url: "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html",
        match: /href="([\/a-zäöü0-9\?\;\,\=\.\-\_\&]*)".*Excel-Version Zugelassene Verpackungen/gi
      };
      log.time("Swissmedic", "Searched in");
      download.link( find, function( urls ) {
        link = urls.pop();
        log.timeEnd("Swissmedic", "Searched in");
        callback(null);
      });     
    },
    function(callback) {
      log.debug("Swissmedic", "Download file", { save:'data/auto/swissmedic.xlsx'});

      var save = {
        directory: "data/auto",
        url: link
      };
      log.time("Swissmedic","Downloaded in");
      download.file( save, function( filename ) {
        log.timeEnd("Swissmedic","Downloaded in");
        callback(null);
      });
    },
    function(callback) {
      log.debug("Swissmedic", "Load korrekturen for atc", { file:'data/manual/swissmedic/atc.csv'});
    
      var csv = fs.readFileSync("./data/manual/swissmedic/atc.csv");
      parse(csv, function(err,data) {
      if( err) throw err;
      if(!err) {
        var atcKorrekturenKnown = {};
        data.forEach( function(cells) {  
          atcKorrekturenKnown[cells[0]] = {
            approval: cells[0],
            atcOriginal: cells[1],
            atcKorrektur: cells[2],
            name: cells[3]
          };
        });
        atcKorrekturen = atcKorrekturenKnown;
        callback(null);
      }
    });
    },
    function(callback) {
      log.debug("Swissmedic","Transform Excel to JSON", {save:'data/release/swissmedic'} );

      xlsxToJSON( "data/auto/swissmedic.xlsx", function( rows )
      {
        if( !fs.existsSync( "./data/release" ) ) fs.mkdirSync( "./data/release" );
        if( !fs.existsSync( "./data/release/swissmedic" ) ) fs.mkdirSync( "./data/release/swissmedic" );
        
        fs.writeFileSync( "data/release/swissmedic/swissmedic.json", JSON.stringify( rows, null, 3 ) ); 
        fs.writeFileSync( "data/release/swissmedic/swissmedic.min.json", JSON.stringify( rows ) ); 
        callback(null);
      });
    },
    function() {
      log.timeEnd("Swissmedic", "Completed in");
      done(null);
    }
  ]);
}

// ACTUAL WORKERS
var link;

// Zugelassene Packungen Swissmedic
function xlsxToJSON( filename, callback )
{
  var excel = xlsx.readFile(filename);
  var worksheet = excel.SheetNames[0];
  var cleaned = [];

  for( var i = 5; i < 20000; i++ )
  {
    var clean = Object.create(null);

    // DONE WITH ROWS
    if( !excel.Sheets[ worksheet ]["A"+i] ) break;

      // Zulassungs-Nummer
    clean.zulassung = ("00000" + excel.Sheets[ worksheet ]["A"+i].v ).slice( -5 );
    // Sequenz
    clean.sequenz = ""+excel.Sheets[ worksheet ]["B"+i].v;
    
    // Sequenzname
    if( excel.Sheets[ worksheet ]["C"+i] ) {
      clean.name = excel.Sheets[ worksheet ]["C"+i].v;
      clean.name = clean.name.replace(/["\\"]/g,"");
    }

    // Zulassungsinhaberin
    clean.hersteller = excel.Sheets[ worksheet ]["D"+i].v;
    // IT-Nummer
    if( excel.Sheets[ worksheet ]["E"+i] ) clean.itnummer = excel.Sheets[ worksheet ]["E"+i].v;
    
    // ATC-Code
    if( excel.Sheets[ worksheet ]["F"+i] ) clean.atc = excel.Sheets[ worksheet ]["F"+i].v;
    
    // Heilmittelcode
    clean.heilmittelcode = excel.Sheets[ worksheet ]["G"+i].v;
    
    // Erstzulassung
    var erst = new Date(1900,0,1); 
    erst.setDate( excel.Sheets[ worksheet ]["H"+i].v - 1);
    clean.erstzulassung = (erst.getDate()) + "." + (erst.getMonth()+1) + "." + (erst.getFullYear());
    
    // Zulassungsdatum
    var zul = new Date(1900,0,1);
    zul.setDate( excel.Sheets[ worksheet ]["I"+i].v - 1);
    clean.zulassungsdatum = (zul.getDate()) + "." + (zul.getMonth()+1) + "." + (zul.getFullYear());

    // Gueltigkeitsdatum
    var valid = new Date(1900,0,1);
    valid.setDate( excel.Sheets[ worksheet ]["J"+i].v -1);
    clean.gueltigkeitsdatum = (valid.getDate()) + "." + (valid.getMonth()+1) + "." + (valid.getFullYear());

    // Verpackungs-Id
    clean.verpackung = ("000" + excel.Sheets[ worksheet ]["K"+i].v ).slice( -3 );
    // Packungsgrösse
    if( excel.Sheets[ worksheet ]["L"+i] ) clean.packungsgroesse = excel.Sheets[ worksheet ]["L"+i].v;
    // Einheit
    if( excel.Sheets[ worksheet ]["M"+i] ) clean.einheit = excel.Sheets[ worksheet ]["M"+i].v;
    // Abgabekategorie
    clean.abgabekategorie = excel.Sheets[ worksheet ]["N"+i].v;
    // Wirkstoffe
    if( excel.Sheets[ worksheet ]["O"+i]) clean.wirkstoffe = excel.Sheets[ worksheet ]["O"+i].v;
    // Zusammensetzung
    if( excel.Sheets[ worksheet ]["P"+i] )
    clean.zusammensetzung = excel.Sheets[ worksheet ]["P"+i].v;
    // Anwendungsgebiet Präparat
    if( excel.Sheets[ worksheet ]["Q"+i] ) clean.anwendungsgebiet = excel.Sheets[ worksheet ]["Q"+i].v;
    // Anwendungsgebeit Sequenz
    if( excel.Sheets[ worksheet ]["R"+i] ) clean.anwendungsgebietsequenz = excel.Sheets[ worksheet ]["R"+i].v;

    // QUESTION VALID
    if( !clean.name || clean.heilmittelcode == "Tierarzneimittel" ) continue;

    // NEU GTIN
    var gtin = "7680" + clean.zulassung + clean.verpackung;
    clean.gtin = gtin + util.eanCheckDigit( gtin );
    
    clean = repairATC( clean );

    cleaned.push( clean );
  }

  callback( cleaned );
};

//---
// atc
// zulassung
//--
function repairATC( raw )
{
 if( atcKorrekturen[raw.zulassung] ) {
    if(atcKorrekturen[raw.zulassung].atcOriginal == raw.atc) {
      raw.atc = atcKorrekturen[raw.zulassung].atcKorrektur;
    }
 }
 return raw;
};

