
// NORMAL CRAWLER
var http = require("http");
var fs = require("fs");
// EXTRACTING
var zipper = require("adm-zip");
var streamifier = require("streamifier");
var zlib = require("zlib");
//XML
var splitter = require('xml-splitter');

var log = require("epha-log");
var files = require("epha-files");

var async = require("async");

module.exports = function(done) {
 log.service = require("../config").service;
  log.transports = require("../config").transports;
  log.task = "KOMP";

  async.series([
    function(callback) {
      log.info("Requesting file << http://download.swissmedicinfo.ch/");
      log.time("TOTAL");
      zustimmen( callback );
    },
    function(callback) {
      log.info( "Split xml", "data/auto/kompendium.xml", "to", "data/release/kompendium/*");

      var filename;

      fs.readdirSync("data/auto").forEach( function( element )
      {
        var match = element.match( /(Aips[\w\s]*.xml|kompendium.xml)/ );
        if( match ) filename = match[0];
      });

      if( filename )
      {
        parseKompendium( filename, function( data ) {
          // FOR SECTIONS
          if( !fs.existsSync( "./data/release" ) ) fs.mkdirSync( "./data/release" );
          if( !fs.existsSync( "./data/release/kompendium" ) ) fs.mkdirSync( "./data/release/kompendium" );

          //searchIndex = searchIndex.replace(/\s*("(id|label)": "[ \w\-,\/\?®"äüöè]*,?)\s*/gi, "$1");
          fs.writeFileSync("./data/release/kompendium/kompendium.json", JSON.stringify(data, null, 3) );
          fs.writeFileSync("./data/release/kompendium/kompendium.min.json", JSON.stringify(data) );
          callback(null);
        });
      }
      else log.error("NOT FOUND", filename );
    },
    function() {
      log.timeEnd("TOTAL");
      done(null);
    }
  ]);
};


// ACTUAL WORKERS
function zustimmen( callback )
{
  log.doing("Requesting zustimmung");

  var uri1 = {
    host: "download.swissmedicinfo.ch",
    path: "/Accept.aspx?ReturnUrl=%2f"
  };

  http.get(uri1, function(res1){

    var html1 = "";
    var cookie1 = "";

    for(var header in res1.headers){
      if( header.toUpperCase() == "SET-COOKIE" ) cookie1 = res1.headers[header][0];
    }

    cookie1 = /([a-zA-Z0-9=_\.]*)/.exec(cookie1)[1];

    res1.on("data", function(chunk){ html1 += chunk; });

    res1.on("end", function()
    {
      var event1 = /id="__EVENTVALIDATION" value="(.*)"/gi.exec( html1 )[1];
      var state1 = /id="__VIEWSTATE" value="(.*)"/gi.exec( html1 )[1];

      var hidden1 = "__VIEWSTATE=" + encodeURIComponent( state1 ) + "&" + "__EVENTVALIDATION=" + encodeURIComponent( event1);

      log.doing( "Starting", res1.statusCode );

      information( callback, hidden1, cookie1);
    });
  });
};

function information( callback, hidden1, cookie1 )
{
  var uri2 = {
    host: "download.swissmedicinfo.ch",
    path: "/Accept.aspx?ReturnUrl=%2f",
    method : "POST",
    headers: {
      "Cookie" : cookie1,
      "Origin": "http://download.swissmedicinfo.ch",
      "Content-Type" : "application/x-www-form-urlencoded"
    }
  };

  var request2 = http.request( uri2, function( res2 )
  {
    var html2 = "";
    var cookie2 = "";

    for(var header in res2.headers){
      if( header.toUpperCase() == "SET-COOKIE" ) cookie2 = res2.headers[header][0];
    }

    res2.on("data", function(chunk){ html2 += chunk; });

    res2.on("end", function(){

      cookie2 = /([a-zA-Z0-9=_\.]*)/.exec( cookie2 )[1];

      log.doing( "Pretending cookies", res2.statusCode );

      download( callback, cookie1 + "; " + cookie2);
    });
  });

  request2.write( hidden1 + "&" + "ctl00%24MainContent%24btnOK=Ja%2C+ich+akzeptiere+%2F+Oui%2C+j%E2%80%99accepte+%2F+S%C3%AC%2C+accetto");
  request2.end();
}


function download( callback, cookie ){

  var options = {
    host: "download.swissmedicinfo.ch",
    path: "/",
    method : "POST",
    headers: {
      "Cookie" : cookie,
      "Content-Type" : "application/x-www-form-urlencoded"
    }
  };

  var request3 = http.request( options, function( res3 )
  {
    var html3 = "";

    res3.on("data", function(chunk) { html3 += chunk; });

    res3.on("end", function()
    {
      var event3 = /id="__EVENTVALIDATION" value="(.*)"/gi.exec( html3 )[1];
      var state3 = /id="__VIEWSTATE" value="(.*)"/gi.exec( html3 )[1];
      var hidden3 = "__VIEWSTATE=" + encodeURIComponent( state3 ) + "&" + "__EVENTVALIDATION=" + encodeURIComponent( event3 );

      log.doing( "Reached target", res3.statusCode );

      downloadYes( callback, hidden3, cookie );
    });
  });
  request3.end();
};

function downloadYes( callback, hidden3, cookie )
{
  var options = {
    url: "http://download.swissmedicinfo.ch/",
    host: "download.swissmedicinfo.ch",
    path: "/",
    method: "POST",
    headers: {
      "Cookie": cookie,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: hidden3 + "&" + "ctl00%24MainContent%24BtnYes=Ja",
    directory:"downloads"
  };
  // EITHER END OR ERROR
  var chunks = [];
  var request4 = http.request( options, function( res4 )
  {
    var filename = 'AipsDownload';

    var size;
    if(res4.headers['content-length']) {
      size = Math.floor( res4.headers['content-length'] );
    }

    log.info( "Filesize", files.size( res4.headers["content-length"] ) );
    log.info( "Server", res4.headers["server"] );

    if(res4.headers['content-disposition']) {
      filename = /filename=["']?([a-zA-Z_0-9]*)/gi.exec(res4.headers['content-disposition'])[1];
    }
    log.time("DOWNLOAD");
    filename += '.xml';

    var loaded = 0;
    var refresh = 0;
    res4.on("data", function(chunk) {
      chunks.push(chunk);

      loaded += chunk.length;

      if( refresh++%100 == 0 )
      {
        log.doing( "Loading", ( loaded / size * 100 ).toFixed(2) + "%" );
      }
    });

    res4.on('end', function() {
      log.timeEnd("DOWNLOAD");
      writeAndExtract(chunks, callback);
    });
  });

  request4.on("error", function( error) {});
  request4.write( options.data );
  request4.end();
  log.doing("");
};

function writeAndExtract( parts, callback ) {

      log.doing("Finished loading");

      var payload = Buffer.concat(parts);

      fs.writeFileSync( "data/auto/kompendium.zip", payload );

      var file = zipper( payload );

      var entries = file.getEntries();

      for(var i=0;i<entries.length;i++)
      {
        if( /.xml$/.test( entries[i].entryName ) ) {
          log.time('ZIP extracted');
          var entry = entries[i];
          var buffer = entry.getCompressedData();

          var stream = streamifier.createReadStream(buffer);
          output = fs.createWriteStream("data/auto/kompendium.xml");

          stream.pipe(zlib.createInflateRaw()).pipe(output);
          output.on('finish', function() {
            log.timeEnd('ZIP extracted');
            callback(null);
          });
          /* SYNC
          zlib.deflate( buffer, function( error, output ) {
            if( error ) console.log( error );
            if(!error) fs.writeFileSync("downloads/kompendium.xml", output.toString() );
          });
          */
        }
      }
    log.doing("");
};


function parseKompendium( filename, callback )
{
  xs = new splitter('/medicalInformations/medicalInformation');

  if( !fs.existsSync( "./data/release" ) ) fs.mkdirSync( "./data/release" );
  if( !fs.existsSync( "./data/release/kompendium" ) ) fs.mkdirSync( "./data/release/kompendium" );

  var items = fs.createWriteStream( "data/release/kompendium/catalog.json");
  items.write("[");

  if( !fs.existsSync( "./data/release/kompendium/de" ) ) fs.mkdirSync( "./data/release/kompendium/de" );
  if( !fs.existsSync( "./data/release/kompendium/de/fi" ) ) fs.mkdirSync( "./data/release/kompendium/de/fi" );
  if( !fs.existsSync( "./data/release/kompendium/de/pi" ) ) fs.mkdirSync( "./data/release/kompendium/de/pi" );
  if( !fs.existsSync( "./data/release/kompendium/fr" ) ) fs.mkdirSync( "./data/release/kompendium/fr" );
  if( !fs.existsSync( "./data/release/kompendium/fr/fi" ) ) fs.mkdirSync( "./data/release/kompendium/fr/fi" );
  if( !fs.existsSync( "./data/release/kompendium/fr/pi" ) ) fs.mkdirSync( "./data/release/kompendium/fr/pi" );
  if( !fs.existsSync( "./data/release/kompendium/it" ) ) fs.mkdirSync( "./data/release/kompendium/it" );
  if( !fs.existsSync( "./data/release/kompendium/it/fi" ) ) fs.mkdirSync( "./data/release/kompendium/it/fi" );
  if( !fs.existsSync( "./data/release/kompendium/it/pi" ) ) fs.mkdirSync( "./data/release/kompendium/it/pi" );

  var done = 0;

  function writePart(data, tag, path)
  {
    if( done > 0 ) items.write(",");

    var item =
    {
      title : data.title.$t,
      type : data.type,
      version : data.version,
      lang :data.lang,
      safetyRelevant : data.safetyRelevant, // "false" | "true"
      authHolder : data.authHolder.$t,
      substances : repairSubstances( data )
    };

    if( data.atcCode ) item.atcCode = data.atcCode.$t;

    if( data.sections && data.sections.section && data.sections.section.length )
    {
      item.sections = [];

      data.sections.section.forEach( function( element ) {
        item.sections.push( { id: element.id, label: element.title.$t} );
      });
    }

    repairAuthHolder( data ).forEach( function( element )
    {
      item.authNrs = (item.authNrs) ? item.authNrs+ " "+element : element;

      log.doing( "#", done++, "Files" ); 

      fs.writeFile("data/release/kompendium/"+item.lang+"/"+item.type+"/"+element+".htm", repairHTML( data ));
    });

    items.write( JSON.stringify( item ) );
  };

  xs.on('data', writePart );

  xs.on('end', function(counter)
  {
    items.on("finish", function()
    {
      // Memory free for grouping stuff
      log.doing("");

      var liste = JSON.parse( fs.readFileSync("data/release/kompendium/catalog.json" ) );

      // GROUPING ZULASSUNG AND Filtering
      var zulassungen = Object.create( null );

      liste.forEach( function( item )
      {
        zulassungen[ item.authNrs ] = zulassungen[ item.authNrs ] || Object.create(null);
        // SPRACHE
        zulassungen[ item.authNrs ][ item.lang ] = zulassungen[ item.authNrs ][ item.lang ] || Object.create(null);
        // PATINFO & FACHINFO
        zulassungen[ item.authNrs ][ item.lang ][ item.type ] = {
          "produkt": item.title,
          "substanz": item.substances,
          "hersteller": item.authHolder,
          "atc": item.atcCode
          //,"sections":item.sections
        };
      });

      var kompendium = {
        "documents":[],
        "_searchterms":["produkt", "substanz", "hersteller", "zulassung", "atc"],
        "version":  new Date().getTime()
      };

      for( var key in zulassungen )
      {
        var item = zulassungen[ key ];

        var group = Object.create(null);
        group.zulassung = key;
if (key == '53005') console.log('53005!!!!!!!!!!!!!!!!!!');
        var lang = [];
        if( item.de ) lang.push( "de" );
        if( item.fr ) lang.push( "fr" );
        if( item.it ) lang.push( "it" );
        group.lang = lang.join(" ");

        var type = [];
        if( item.de && item.de.fi ) type.push( "fi" );
        if( item.de && item.de.pi ) type.push( "pi" );
        group.type = type.join(" ");

        group.produkt = ( item.de.fi ) ? item.de.fi.produkt : item.de.pi.produkt;
        group.substanz = ( item.de.fi ) ? item.de.fi.substanz : item.de.pi.substanz;
        group.hersteller = ( item.de.fi ) ? item.de.fi.hersteller : item.de.pi.hersteller;
        group.atc = ( item.de.fi ) ? item.de.fi.atc : item.de.pi.atc;

        kompendium.documents.push( group );
      }

      log.info("Found", counter, "Files in weird xml");

      callback( kompendium );
    });

    items.write("]");

    items.end();
  });

  var streamIn = fs.createReadStream("data/auto/"+filename, { start:3 } );

  xs.parseStream( streamIn );
};


// Parse XML Kompendium
function repairAuthHolder( raw )
{
  var zulassungen = [];

  // 3 -5 ZIFFERN
  if( raw.authNrs && raw.authNrs.$t && /\d{3,5}/.test( raw.authNrs.$t )  )
  {
    // NORMALIZE
    raw.authNrs.$t.replace("'", "").match( /\d{3,5}/g ).forEach( function( element )
    {
        zulassungen.push( ( "00000" + element ).slice(-5) );
    });
  }
  else
  {
    // MISSINGS
    if( raw.title.$t == "Iropect Bronchialpastillen" ) zulassungen.push( "43836" );
    if( raw.title.$t == "Iropect pastilles pour les bronches" ) zulassungen.push( "43836" );
    if( raw.title.$t == "Regenaplex Nr. 12 Tropfen" ) zulassungen.push( "36846" );
    if( raw.title.$t == "Regenaplex Nr. 12 Gouttes" ) zulassungen.push( "36846" );
    if( raw.title.$t == "Parsenn Crème pour herpès" ) zulassungen.push( "56967" );
    if( raw.title.$t == "Parsenn Herpes Creme" ) zulassungen.push( "56967" );
    if( raw.title.$t == "Norit®" ) zulassungen.push( "44812" );
    if( raw.title.$t == "Sérocytol®" ) zulassungen.push( "00332","00328","00278","00279","00277","00282","00284","00286","00288","00294","00295","00296","00300","00306","00309","00313","60026","00314","00315","00316","00299","00330","00334","00335","00338","00339" );
  }

  if( zulassungen.length == 0 ) log.error( "MISSING AUTHNR", raw.authNrs, raw.title.$t );

  return zulassungen;
};

function repairSubstances( raw )
{
  if( raw.substances && raw.substances.$t && /\w{3,}/g.test( raw.substances.$t ) ) return raw.substances.$t;

  if( raw.type == "fi" && raw.lang == "de" && raw.title.$t == "Sérocytol®" ) return "Pferdeglobuline";
  if( raw.type == "fi" && raw.lang == "de" && raw.title.$t == "Addamel® N" ) return "Spurenelemente";
  if( raw.type == "fi" && raw.lang == "de" && raw.title.$t == "Aequifusine®" ) return "Elektrolyte";
  if( raw.type == "fi" && raw.lang == "de" && raw.title.$t == "ALK wässrig® SQ" ) return "Allergene";

  //TODO
  //if( raw.type == "fi" && raw.lang == "de" )
  //console.log( "ERROR MISSING SUBSTANCE", raw.substances, raw.title.$t, raw.authNrs.$t );

  return "Keine Angaben";
}


function repairHTML( raw )
{
    var html = "";
    var pad0 = "";
    var pad1 = "  ";
    var pad2 = "    ";
    var pad3 = "      ";

    html += pad0+"<html>\n";
    html += pad1+"<head>\n";
    html += pad2+"<meta charset='UTF-8'>\n";
    html += pad2+"<style>\n";
    html += pad3+raw.style.$t.split("}").join( "}\n"+pad3 );
    html += "\n";
    html += pad3+"/* KORREKTUR */\n";
    html += pad3+'#monographie { margin:30px; }\n';
    html += pad3+"</style>\n";
    html += pad1+"</head>\n";
    html += pad1+"<body>\n";

    var tags = raw.content.$cd;
    // --
    // Convert encoding
    // var iconv = require('iconv-lite');
    // var buf = iconv.encode(tags, 'win1251');
    // tags = iconv.decode(buf, 'utf-8');

    var entities = tags.match(/(&[^(kappa|harr|frasl|hellip|deg|reg|gt|lt|ge|le|nbsp|auml|ouml|uuml|rsquo|ecirc|ocirc|eacute|agrave|egrave|ccedil)][a-z]+\;)/gi);
    if (entities) {
        // console.log(" entitie: " + raw.title.$t + " _" + entities.join("_") + "_");
    }

    var nonascii = tags.replace(/­/g, "").replace(/­/g, "");
    nonascii = nonascii.match(/([^(\u200B-\u200D\uFEFF §äöüβ«»≪≫˚°’‘ʼʺ·∙•●‰≙≅≤≥↓↑→±×−–‑‒ ̶œїïâàçéêëèîóôùû™®καµγΩδΔτøß½⅓⅔¼¾¹²³₁₂₃₆)\x00-\x7F]+)/gi);
    if (nonascii){
        // console.log(" nonascii: " + raw.title.$t + " _" +  nonascii.join("_") + "_");
        //
        if (nonascii.join("").indexOf("ë") > -1){
          // console.log(tags.match(/\s(ë[^\s]+)\s/gi));
        }

    }

    if (raw.title.$t == "Tomudex®"){
      tags = tags.replace(/&yen;/gi, "&infin;");
    }

    if (raw.title.$t == "Menopur®/Menopur® Multidose"){
      tags = tags.replace(/&yen;/gi, "&infin;");
    }

    // ERROR IN XML &pound; instead &le; Candesartan Takeda
    // LESS OR EQUAL
    tags = tags.replace( /&pound;/gi, "&#8804;" );
    // REGISTERED TRADEMARK
    tags = tags.replace( /&Ograve;/gi, "&#174;" );
    // Ű TO Ü
    tags = tags.replace( /Ű/g, "Ü" );

    // REMOVE <?xml version="1.0" encoding="utf-8"?>
    tags = tags.replace( /<?[\s\."=\w\?-]*\?>/, "");
    // CHANGE <div xmlns="http://www.w3.org/1999/xhtml"> <div id="monographie">
    tags = tags.replace(/^(<[\w\s]*)(?: xmlns="[\w\.\/\:]*")(>)/,'$1 id="monographie"$2\n');

    html += pad2+tags;
    html += pad1+"</body>\n";
    html += pad0+"</html>";

    return html;
};
