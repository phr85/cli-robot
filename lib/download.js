// SECURE CRAWLER
var https = require("https");
// NORMAL CRAWLER
var http = require("http");
// SAVING FILE
var fs = require("fs");
// EXTRACTING
var zipper = require('adm-zip');
var streamifier = require('streamifier');
var zlib = require('zlib');

var log = require("../lib").log;


if( !fs.existsSync( "./data" ) ) fs.mkdirSync( "./data" );
if( !fs.existsSync( "./data/auto" ) ) fs.mkdirSync( "./data/auto" );

var debug = false;

module.exports.link = function( params, callback )
{
  var crawler = ( /^https/.test( params.url ) ) ? https : http;

  var uri =
  {
    host: /^http[s]*:\/\/([a-z.-]*)\//gi.exec( params.url )[1]
    ,
    path: /^http[s]*:\/\/[a-z.-]*(\/.*)/gi.exec( params.url )[1]
  };

  log.debug("Download", "Request", { host: uri.host } );

  crawler.get( uri , function(res)
  {
    if( res.statusCode == 200 ) {
      log.doing("Download", "Parsing.." );
    }else {
      log.error("Download", "Error", { status:res.statusCode });
    }
    // DEBUGGING
    // for(var header in res.headers) console.log( header.toUpperCase(), res.headers[header] );

    // ENCODING
    res.setEncoding("utf8");
    // LEFT PART OF LINK
    var base = /(^http[s]*:\/\/[a-z.-]*)\//gi.exec( params.url )[1];

    var links = [];
    var html = "";

    res.on("data", function(chunk)
    {
      html += chunk;
    });

    res.on("end", function()
    {
      // REGEX HAS TO BE GLOBAL
      while( ( match = params.match.exec( html ) ) !== null )
      {
        // RIGHT PART
        var link = match[1].replace( /&amp;/g, "&" );

        // LINK STARTS AT ROOT OF HOST
        if( /^\//.test( link ) )
        links.push( /(^http[s]*:\/\/[a-z.-]*)\//gi.exec( params.url )[1] + link );

        // LINK IS RELATIVE
        if( /^[a-zA-Z]/.test( link ) )
        links.push( /(.*\/)/.exec( params.url )[1] + link );
      }

      callback( links );
    });
  });
};

module.exports.onedrive = function( params, callback )
{
  // GET HEADER RESPONSE FROM REDIRECT
  var request = https.request( params, function( redirect )
  {     
    var file = redirect.headers.location;
    
    redirect.on("data", function(chunk) {}); 
    
    redirect.on("end", function() 
    { 
      https.get( file, function( res )
      {
        var chunks = []; 

        res.on( "readable", function() 
        { 
          var buff = res.read();
          chunks.push(buff); 
        });

        res.on( "end", function() 
        { 
          var file = Buffer.concat( chunks );

          require("fs").writeFileSync( "data/temp/"+params.filename, file );
          
          callback();
        });                      
      });
    });  
  });
  
  request.end();
};

module.exports.file = function( params, callback )
{
  var crawler = ( /^https/.test( params.url ) ) ? https : http;

  if( ! /^http[s]*:\/\/([a-z.-]*)\//gi.test( params.url ) )
  {
    log.error("Download", "Link not found", { url: params.url });
    return;
  }

  var uri = {
    host: /^http[s]*:\/\/([a-z.-]*)\//gi.exec( params.url )[1] ,
    path: /^http[s]*:\/\/[a-z.-]*(\/.*)/gi.exec( params.url )[1],
    method: params.method || "GET"
  };

  if( params.headers ) uri.headers = params.headers;

  log.doing("Download", "Downloading..");

  var requesting = crawler.request(uri, function(res)
  {
    if( res.statusCode == 200 ) {
      log.doing("Download", "Parsing.." );
    }else {
      log.error("Download", "Error", { status:res.statusCode });
    }
    var filename;
    var size;

    for(var header in res.headers)
    {
      //console.log( header.toUpperCase(), res.headers[header] );
      if( header == "content-disposition" ) filename = /filename=["']?([a-zA-Z_0-9\.]*)/gi.exec( res.headers[header] )[1];
      if( header == "content-length" ) size = Math.floor( res.headers['content-length'] );
    }
    
    if( params.filename ) filename = params.filename;

    // ARCHIV
    if( /\.zip$/.test( filename ) )
    {
      var chunks = [];

      var loaded = 0;
      var refresh = 0;
      // FULL ARCHIV BEFORE EXTRACTABLE
      res.on("data", function( chunk ) { 
        chunks.push( chunk );
      
        loaded += chunk.length;
      
        if( refresh++%100 == 0 && size > 0)
        {
          log.doing("Download", "File", ( loaded / size * 100 ).toFixed(2) + "%" );
        }
      });

      res.on("end", function()
      {
        var file = Buffer.concat( chunks );
        var zip = new zipper( file );

        zip.getEntries().forEach(function(zipEntry)
        {
          var filename = zipEntry.entryName;
          var save = "";

          //BAG
          if ( /Preparations.xml/.test( filename ) ) save = "bag.xml";
          if ( /Publications.xls/.test( filename ) ) save = "bag.xls";
          if ( /ItCodes.xml/.test( filename ) ) save = "it.xml";

          //WIDO
          if ( /widode.xlsx/.test( filename ) ) save = "atc.xlsx";

          // DRUGBANK
          if(/drugbank.xml/.test( filename) )  save = "drugbank.xml";
          
          // TARMED
          if(/TARMED.*.mdb/.test( filename) )  save = "tarmed.mdb";
          
          // POSTLEITZAHLEN
          if(/plz.*.txt/.test( filename) )  save = "plz.txt";

          if( save.length > 0 )
          { 
            fs.writeFileSync( params.directory + "/" + save, zip.readFile( filename ) );

            log.doing("Download", "Save" );
          }
          
        });

        callback( filename );
      });
    }
    // NORMALE FILES
    else
    {
      var save = "";

      // SWISSMEDIC
      if( /Zugelassene_Packungen_([0-9]*).xlsx/.test( filename ) )
      {
        save = "swissmedic.xlsx";
      }

      if( filename == "bfs.xls" ) save = filename;

      if( filename == "drg.xlsx" ) save = filename;

      if( save )
      {
        var stream = fs.createWriteStream( params.directory + "/" + save );
        
        res.on("data", function(chunk) {
          stream.write( chunk );
        });
        
        stream.on("finish", function() {
          callback( save || filename );
        });
        
        res.on("end", function()
        {
          stream.end();
        });
      }
      else log.error("Download","Filename missing" );
    }

  });

  // PAYLOAD
  if( params.data ) requesting.write( params.data );

  requesting.end();
};

/* 
 * GEBRECHEN
 */
module.exports.gebrechen = function( callback )
{
  var uri = {
    host: "www.bag.admin.ch",
    path: "/themen/krankenversicherung/00263/00264/00265/index.html?lang=de"
  };

  http.get(uri, function(res){

    var html = "";
    
    res.on("data", function(chunk){ html += chunk; });
    res.on("end", function()
    {
      var match = /href="(.*)">Geburts/.exec( html );
      
      gebrechenParseHTML( match[1], callback );
    });
  });
};

function gebrechenParseHTML( uri, callback ) {
  
  var jsdom = require("jsdom");

  jsdom.env(
    uri
    ,
    ["http://code.jquery.com/jquery.js"]
    ,
    function (errors, window) {
      
      var data = window.$("table tr").map(function(i)
      {  
        if( i < 2 ) return;
        
        var content = window.$(this).find('td');
            
        var row = {
          punkte:"",
          bag:[],
          produkt:[],
          swissmedic8:"",
          pharmacode:"",
          aufnahme:""
        };

        content.each(function(i) {
          
          var current = window.$(this).text();
          
          if(i==1 && current == "(L)")
          {
            var limitatio = window.$(this).parent().next().remove();

            limitatio.find("ul").each( function(i) 
            {
              var limit = { de:"", fr:"", it:"" };
              
              window.$(this).find("li").each( function(j) {
                if( j == 0 ) limit.de = window.$(this).text();
                if( j == 1 ) limit.fr = window.$(this).text();
                if( j == 2 ) limit.it = window.$(this).text();
              });
              
              row.bag.push(limit);
            });
          }
          
          if(i==2)  
          {
            var parts = current.split(/(\r\n|<br>|<br \/>)/gi);
            var clean = parts.map( function(item) { return item.trim(); });
            var missing = clean.filter( function( undef ) { return !!undef; });

            row.produkt.push( missing.join(", ") );
          }
     
          if(i==3)
          {
            var parts = /\[(.*)\]\s\((.*)\)/.exec( current );
            
            if( parts && parts.length == 3 ) 
            {
              row.swissmedic8 = parts[1];
              row.pharmacode = parts[2];
            }
          }
          
          if(i==4) row.aufnahme = current.trim();

        });
        return row;
        
      }).get();
      
      fs.writeFileSync( "data/temp/gebrechen.json", JSON.stringify( data, null,3 ) ); 
      
      callback( null );
    }
  );

};
