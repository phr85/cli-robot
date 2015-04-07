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

      // PARSE AND CORRECT
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

  // https://github.com/epha/robot/issues/7

  function setCharAt(str,index,chr){
      if (index > str.length-1) return str;
      return str.substr(0, index) + chr + str.substr(index + 1);
  }

  var testUpperCase = /^([ÄÖÜA-Z\s,\.]+)$/;
  var excludeWords = /^(alle|auf|bei|die|den|der|dere[n|r]|des|das|für|gege[n|m]+|etc\.|in|mit|nach|oder|ohne|rein|und|vom|von|zur)$/;
  var excludeWords2 = /^(andere[n|r]?|anthroposophische[n|r]?|antineoplastisch[e]?[n|r]?|arterielle[n|r]?|bedingte[n|r]?|blutbildende[n|r]?|dermatologische[n|r]?|direkt[e]?[n|r]?)$/;
  var excludeWords3 = /^(eingesetzte[n|r]?|exkl\.|fördernde[n|r]?|funktionelle[n|r]?|hergestellt[e]?[n|r]?|homöopathische[n]?|immunmodulierend[e]?[n|r]?|inkl\.)$/;
  var excludeWords4 = /^(lokale[n|r]?|nichttherapeutisch[e]?[n|r]?|obstruktiv[e]?[n|r]?|periphe[n|r]?|pflanzliche[n|r]?|sparende[n|r]?|stimulierende[r|n]?|systemische[n|r]?|topische[n|r]?)$/;
  var excludeWords5 = /^(übrige[n|r]?|vaskulär[e]?[n|r]?|verwandte[n|r]?|virale[n|r]?|vorwiegende[n|r]?|weibliche[n|r]?|wirkende[n|r]?|zentral[e]?[r|n]?)$/;
  var ivanka = /^(alimentär|antiviral|beeinfluss|benign|gastroesophageal|gastrointestinal|importiert|inhalativ|kombiniert|natürlich|parenteral|peptisch|therapeutisch|wirkend)[e]?[m|n|r|s]?$/;
  var romNum = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i;
  var abbr = /^(ACTH|ADHD|DMPS)$/i;

  Object.keys(cleaned).forEach(function(atc){
    if (testUpperCase.test(cleaned[atc].name)){

      var lowered = cleaned[atc].name.toLowerCase();

      var Capitalized = lowered.split(' ').map(function(word, i){
        if (!word) return null;
        if (abbr.test(word) || romNum.test(word)) return word.toUpperCase();
        if (i === 0 || (!excludeWords.test(word) && !excludeWords2.test(word) && !excludeWords3.test(word) &&
          !excludeWords4.test(word) && !excludeWords5.test(word) &&
          !ivanka.test(word))
        ){
          return setCharAt(word, 0, word[0].toUpperCase());
        }
        return word;
      }).join(' ');

      // console.log(atc);
      // console.log(cleaned[atc].name);
      // console.log(Capitalized + '\n');

      cleaned[atc].name = Capitalized;
    }
  });

  /*
  // https://github.com/epha/robot/issues/8

  var testFirstChar = /^(^[ÄÖÜA-Z])/;

  Object.keys(cleaned).forEach(function(atc){
    if (!testFirstChar.test(cleaned[atc].name)){
      console.log(cleaned[atc].name);
    }
  });
  */



  // MISSING ATC BUT In SWiSSMEDIC ADDING
  if( !cleaned.N06DX02 ) cleaned.N06DX02 = { name: "Ginkgo folium", ddd : "0.12 g O" };
  if( !cleaned.N04BA02 ) cleaned.N04BA02 = { name: "Levodopa und Decarboxylasehemmer", ddd : "0.6 g O" };
  if( !cleaned.C01EB04 ) cleaned.C01EB04 = { name: "Weissdorn"};
  if( !cleaned.N05CM09 ) cleaned.N05CM09 = { name: "Baldrian"}; // valerianae extractum ethanolicum siccum
  if( !cleaned.B06AA11 ) cleaned.B06AA11 = { name: "Bromelain"};
  if( !cleaned.G04CX02 ) cleaned.G04CX02 = { name: "Sägepalme sabal"};
  if( !cleaned.A05BA03 ) cleaned.A05BA03 = { name: "Mariendistel"};
  if( !cleaned.A10BX01 ) cleaned.A10BX01 = { name: "Guarmehl"}; // guari farina
  if( !cleaned.G02CX04 ) cleaned.G02CX04 = { name: "Cimicifuga"};
  if( !cleaned.G04CX01 ) cleaned.G04CX01 = { name: "Pygeumrindenextrakt"}; // pygei africani extractum, urticae radicis extractum siccum
  if( !cleaned.S01AX11 ) cleaned.S01AX11 = { name: "Ofloxacin"};
  if( !cleaned.R07AA02 ) cleaned.R07AA02 = { name: "Phospholipide"};
  if( !cleaned.S01AX13 ) cleaned.S01AX13 = { name: "Ciprofloxacin"};
  if( !cleaned.M03AX01 ) cleaned.M03AX01 = { name: "Botulinumtoxin"};
  if( !cleaned.B02BC10 ) cleaned.B02BC10 = { name: "Fibrinogen human, Factor XIII, Aprotinin und Thrombinum human"};
  if( !cleaned.G02CX03 ) cleaned.G02CX03 = { name: "Mönchspfeffer"}; // agni casti extractum ethanolicum siccum
  if( !cleaned.N01AX01 ) cleaned.N01AX01 = { name: "Droperidol"};
  if( !cleaned.S01AX22 ) cleaned.S01AX22 = { name: "Moxifloxacin"};
  if( !cleaned.N02AA09 ) cleaned.N02AA09 = { name: "Diamorphin"};
  if( !cleaned.D06BB12 ) cleaned.D06BB12 = { name: "Camellia"}; // extractum siccum raffinatum
  if( !cleaned.C09DA09 ) cleaned.C09DA09 = { name: "Chlortalidon"};
  if( !cleaned.A10BX13 ) cleaned.A10BX13 = { name: "Albiglutid"};
  if( !cleaned.J05AR13 ) cleaned.J05AR13 = { name: "Dolutegravir, Abacavirum und Lamivudin"};
  if( !cleaned.R03BB07 ) cleaned.R03BB07 = { name: "Umeclidin"};
  if( !cleaned.L01XE27 ) cleaned.L01XE27 = { name: "Ibrutinib"};
  if( !cleaned.S01EC54 ) cleaned.S01EC54 = { name: "Brinzolamid und Brimonidin"};
  if( !cleaned.L01XX47 ) cleaned.L01XX47 = { name: "Idelalisib"};


  callback( cleaned );
}
