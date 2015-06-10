"use strict";

var fs = require("fs");
var pathResolve = require("path").resolve;

var splitter = require('xml-splitter');

var log = require("../").log;

var repairSubstances = require("./repairSubstances");
var repairAuthHolder = require('./repairAuthHolder');
var repairHTML = require('./repairHTML');

function parseKompendium(cfg) {
  return new Promise(function (resolve, reject) {
    var xs = new splitter('/medicalInformations/medicalInformation');

    var items = fs.createWriteStream(cfg.release.catalog);

    items.on("error", reject);
    items.write("[");

    var done = 0;
    var writtenFiles = {};
    var filesPerAuthNr = {};

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
        substances : repairSubstances( data ),
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
        var file = item.lang + "/" +item.type + "/" +element + ".htm";
        var fullFile = cfg.release.dir + "/" + file;

        item.authNrs = (item.authNrs) ? item.authNrs+ " "+element : element;

        if (!Array.isArray(filesPerAuthNr[item.authNrs])) {
          filesPerAuthNr[item.authNrs] = [];
        }
        filesPerAuthNr[item.authNrs].push(file);

        if (!writtenFiles[fullFile]) {
          log.doing( "Kompendium", "Files #", done++ );

          fs.writeFile(fullFile, repairHTML( data ));

          writtenFiles[fullFile] = true;
        }
      });

      items.write( JSON.stringify( item ) );
    }

    xs.on('data', writePart );

    xs.on("error", reject);

    xs.on('end', function(counter)
    {
      items.on("finish", function()
      {
        // Memory free for grouping stuff
        var liste = JSON.parse( fs.readFileSync(cfg.release.catalog));

        // GROUPING ZULASSUNG AND Filtering
        var zulassungen = Object.create( null );

        liste.forEach( function( item )
        {
          zulassungen[ item.authNrs ] = zulassungen[ item.authNrs ] || Object.create(null);
          zulassungen[ item.authNrs ].files = item.files;
          // SPRACHE
          zulassungen[ item.authNrs ][ item.lang ] = zulassungen[ item.authNrs ][ item.lang ] || Object.create(null);
          // PATINFO & FACHINFO
          zulassungen[ item.authNrs ][ item.lang ][ item.type ] = {
            "produkt": item.title,
            "substanz": item.substances,
            "hersteller": item.authHolder,
            "atc": item.atcCode,
            "files": item.files
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
          group.files = filesPerAuthNr[key];

          kompendium.documents.push( group );
        }

        log.debug("Kompendium", "Files in weird xml", { count:counter});

        resolve( kompendium );
      });

      items.write("]");

      items.end();
    });

    var streamIn = fs.createReadStream(cfg.download.zipFiles[0].dest, { start:3 });

    xs.parseStream( streamIn );
  });
}

module.exports = parseKompendium;