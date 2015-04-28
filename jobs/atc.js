"use strict";

var fs = require("fs");
//var xlsx = require('xlsx');
//var async = require("async");
//var parse = require("csv-parse");
var log = require("../lib").log;
var path = require("path");
//var download = require("../lib/download");

var list_de = {};
var list_de_ch = {};

//var addFile = path.resolve(__dirname, "../data/manual/atc", "add.csv");
//var capitalizeFile = path.resolve(__dirname, "../data/manual/atc", "capitalize.csv");
//var changeFile = path.resolve(__dirname, "../data/manual/atc", "change.csv");

var cfg = {
  "download": {
    "url": "http://wido.de/amtl_atc-code.html",
    "dir": path.resolve(__dirname, "../data/auto/"),
    "file": path.resolve(__dirname, "../data/auto/atc.xlsx")
  },
  "manual": {
    "addFile": path.resolve(__dirname, "../data/manual/atc", "add.csv"),
    "capitalizeFile": path.resolve(__dirname, "../data/manual/atc", "capitalize.csv"),
    "changeFile": path.resolve(__dirname, "../data/manual/atc", "change.csv")
  },
  "process": {
    "dir": path.resolve(__dirname, "../data/release/atc")
  }
}

var disk = require("../lib/disk");
var fetchHTML = require("../lib/fetchHTML");
var parseLink = require("../lib/parseLink");
var downloadFile = require("../lib/downloadFile");
var readXLSX = require("../lib/atc/readXLSX");
var addCodes = require("../lib/atc/addCodes");
var modifyCodes = require("../lib/atc/modifyCodes");
var modifyNames = require("../lib/atc/modifyNames");

module.exports = function(done) {

  log.info("ATC", "Get, Load and Parse");
  log.time("ATC", "Completed in");

  disk.ensureDir(cfg.download.dir, cfg.process.dir)
    .then(function () {
      log.time("ATC", "Get HTML");
      return fetchHTML(cfg.download.url);
    })
    .then(function (html) {
      log.timeEnd("ATC", "Get HTML");
      log.time("ATC", "Parse Link");
      return parseLink(cfg.download.url, html, /href="(.*atc.*\.zip)"/im);
    })
    .then(function (parsedLink) {
      log.timeEnd("ATC", "Parse Link");
      log.time("ATC", "Download");
      return downloadFile(parsedLink, cfg.download.file);
    })
    .then(function () {
      log.timeEnd("ATC", "Download");
      log.time("ATC", "Read Files");
      return readXLSX(cfg.download.file); //@TODO readXLSX_DE ???
    })
    .then(function (parsedXLSX) {
      log.debug("ATC", "Modify Codes");
      return addCodes(cfg.manual.addFile, parsedXLSX);
    })
    .then(function (parsedXLSXwAddedCodes) {
      log.debug("ATC", "Modify Codes");
      return modifyCodes(cfg.manual.changeFile, parsedXLSXwAddedCodes);
    })
    .then(function (parsedXLSXwModifiedCodes) {
      log.debug("ATC", "Modify Names");
      return modifyNames(cfg.manual.capitalizeFile, parsedXLSXwModifiedCodes)
    })
    .then(function () {

    })


  async.series([
    //function(callback) {
    //  log.info("ATC", "Get, Load and Parse");
    //  log.time("ATC", "Completed in");
    //  callback(null);
    //},
    //function(callback) {
    //  log.debug("ATC", "Search Link", { url:"wido.de" });
    //  var params = {
    //    url: "http://wido.de/amtl_atc-code.html",
    //    match: /href="(.*atc.*\.zip)"/gim,
    //    method: "GET"
    //  };
    //  log.time("ATC", "Search Download");
    //  download.link( params, function( urls ) {
    //    // NEWEST LINK IS LAST IN THE LIST
    //    link = urls.pop();
    //    log.timeEnd("ATC", "Search Download");
    //    callback(null);
    //  });
    //},
    //function(callback) {
    //  log.debug("ATC", "Download File", {name:"atc.xlsx"});
    //
    //  var save = {
    //    directory: "data/auto",
    //    filename:"atc.zip",
    //    url: link
    //  };
    //  log.time("ATC", "Download File in");
    //  download.file( save, function( filename ) {
    //    log.timeEnd("ATC", "Download File in");
    //    callback(null);
    //  });
    //
    //},
    //function(callback) {
    //  log.debug("ATC", "Transform xlxs To JSON");
    //  // PARSE AND CORRECT
    //  xlsxToJson( "data/auto/atc.xlsx", callback);
    //},
    //function(callback) {
    //  log.debug("ATC", "Add Codes");
    //  // PARSE AND CORRECT
    //  addCodes( callback );
    //},
    //function(callback) {
    //  log.debug("ATC", "Modify Codes");
    //  // PARSE AND CORRECT
    //  modifyCodes( callback );
    //},
    //function(callback) {
    //  log.debug("ATC", "Modify Names");
    //  // PARSE AND CORRECT
    //  modifyNames( callback );
    //},
    // @TODO next steps here
    function(callback) {
      log.debug("ATC","Remove empty strings");
      
      Object.keys(list_de).forEach(function(key) {
        list_de[key].name =list_de[key].name.trim();
        
        if( list_de[key].ddd ) {
          list_de[key].ddd = list_de[key].ddd.trim();
        }
        if( !list_de[key].ddd ){
          list_de[key].ddd = undefined;
        }
      });
      
      callback(null);
    },
    function(callback) {
      log.debug("ATC","Write CH file");
    
      var de_ch = {};
      var ch_packungen = {};
      var swissmedic = JSON.parse(fs.readFileSync("./data/release/swissmedic/swissmedic.json")); 
        
      if(!swissmedic) {
        log.error("ATC","Please load swissmedic first");
        callback(null);
      }
      swissmedic.forEach( function(packung) {
        if(!packung.atc) {
          return;
        }
        ch_packungen[packung.atc] = true;
      });

      Object.keys(list_de).forEach( function(code) {        
        if(ch_packungen[code]){
          // All codes above
          for( var i = 1; i < code.length; i++) {
            list_de_ch[code.substr(0,i)] = list_de[code.substr(0,i)];
          }
          list_de_ch[code] = list_de[code];
        }
      });      
      
      callback(null);
    },
    function(callback) {
      log.debug("ATC", "Transform Written to Files");
    
      if( !fs.existsSync( "./data/release" ) ) fs.mkdirSync( "./data/release" );
      if( !fs.existsSync( "./data/release/atc" ) ) fs.mkdirSync( "./data/release/atc" );

      fs.writeFileSync( "./data/release/atc/atc.json", JSON.stringify( list_de, null, 3 ) );
      fs.writeFileSync( "./data/release/atc/atc.min.json", JSON.stringify( list_de ) );

      fs.writeFileSync( "./data/release/atc/atc_de-ch.json", JSON.stringify( list_de_ch, null, 3 ) );
      fs.writeFileSync( "./data/release/atc/atc_de-ch.min.json", JSON.stringify( list_de_ch ) );

      callback(null);
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

      Object.keys(list_de).forEach( function( code ) {
        csv.write( '"'+code+'","'+list_de[code].name+'","'+list_de[code].ddd+'"\n');
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
//function xlsxToJson( filename, callback )
//{
//  var excel = xlsx.readFile(filename);
//  var worksheet;
//
//  excel.SheetNames.forEach(function(sheet) {
//    if( sheet.toUpperCase().indexOf( "ATC-CODE MIT") > -1 )
//    worksheet = sheet;
//  });
//
//  if(!worksheet) {
//    log.error("ATC","No Worksheet");
//    callback(null);
//  }
//
//  // ATC-CODES UNIQUE
//  var empty = [];
//
//  // KEIN HEADER
//  for( var i = 2; i < 20000 && empty.length < 10; i++ )
//  {
//    var atc = excel.Sheets[ worksheet ]["A"+i];
//    var name = excel.Sheets[ worksheet ]["C"+i];
//    var ddd = excel.Sheets[ worksheet ]["E"+i];
//
//    var row = {};
//
//    empty.push("Keine Einträge");
//
//    if( atc && atc.v.length > 0 && atc.v.length < 13) row.atc = atc.v.replace(/"/g,"").trim();
//    else continue;
//
//    if( name ) row.name = name.v.replace(/("|\r\n)/g,"").trim();
//    else continue;
//
//    if( ddd ) row.ddd = ddd.v.replace(/("|\r\n)/g,"").trim();
//
//    empty = [];
//
//    list_de[ row.atc ] = { name : row.name, ddd : row.ddd };
//  }
//
//  callback(null);
//}

//function addCodes( callback ) {
//
//  var add = fs.readFileSync(addFile);
//
//  parse(add, function(err, data) {
//
//    if( err) throw err;
//
//    data.forEach( function(row){
//      if(!list_de[row[0]] ) {
//        list_de[row[0]] = { name: row[1], ddd: row[2] };
//      }
//    });
//
//    callback(null);
//  });
//}

function modifyNames( callback ) {

  var names = fs.readFileSync(capitalizeFile);

  parse(names, function(err, data) {

    if( err) throw err;

    data.forEach( function(row){
      if(list_de[row[0]] ) {
        list_de[row[0]].name = row[1];
      }
    });

    callback(null);
  });
}

// oldcode, oldname, olddd, newcode, newname, newddd
//function modifyCodes( callback ) {
//
//  var change = fs.readFileSync(changeFile);
//
//  parse(change, function(err, data) {
//
//    if(err) {
//      log.warn("ATC","Not modifying",err);
//    }
//
//    if( data ) {
//      data.forEach( function(row){
//        if(list_de[row[0]] && list_de[row[0]].name == row[1] && list_de[row[0]].ddd == row[2]) {
//          delete list_de[row[0]];
//
//          if(!list_de[row[3]]) {
//            list_de[row[3]] = { name: row[5], ddd: row[5] };
//          }
//        }
//      });
//    }
//
//    callback(null);
//  });
//}
