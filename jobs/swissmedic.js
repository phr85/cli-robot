var download = require("../lib/download");

var xlsx = require('xlsx');
var util = require("../lib/util");
var fs = require("fs");
var async = require("async");
var log = require("epha-log");

module.exports = function(done) {
 log.service = require("../config").service;
  log.transports = require("../config").transports;
  log.task = "swissmedic";
  
  async.series([ 
    function(callback) {  
      log.info("Search link in https://www.swissmedic.ch/");
      log.time("TOTAL");

      var find = {
        url: "https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html",
        match: /href="([\/a-zäöü0-9\?\;\,\=\.\-\_\&]*)".*Excel-Version Zugelassene Verpackungen/gi
      };
      log.time("SEARCHED");
      download.link( find, function( urls ) {
        link = urls.pop();
        log.timeEnd("SEARCHED");
        callback(null);
      });     
    },
    function(callback) {
      log.info("Download file and save to 'data/auto/swissmedic.xlsx'" );

      var save = {
        directory: "data/auto",
        url: link
      };
      log.time("DOWNLOAD");
      download.file( save, function( filename ) {
        log.timeEnd("DOWNLOAD");
        callback(null);
      });
    },
    function(callback) {
      log.info( "Transform Excel to JSON and save in 'data/release/swissmedic'" );

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
      log.timeEnd("TOTAL" );
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
    if( excel.Sheets[ worksheet ]["C"+i] )clean.name = excel.Sheets[ worksheet ]["C"+i].v;

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

function repairATC( raw )
{
  if( raw.atc == "C05BA" && raw.name == "Hirudoid, Creme" ) raw.atc = "C05BA01";
  if( raw.atc == "R05CA" && raw.name == "Mucosil Phyto Junior, sirop pectoral" ) raw.atc = "R05CA10";
    
  var johannis = [];
  johannis.splice(0,0,'62884','62658','58544','58102','62658','53148','57009','54729','55676','53790');
  johannis.splice(0,0,'44553','54826','54859','56225','57605','53924');
  
  if( johannis.indexOf( raw.zulassung ) > -1 )
  {
    if( raw.atc == "N06AX" ) raw.atc = "N05CP03";
    if( raw.atc == "N05CM" ) raw.atc = "N05CP03";
  }
  
  return raw;
};
