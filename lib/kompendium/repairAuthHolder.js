"use strict";

var log = require("../").log;

function repairAuthHolder( raw ) {
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
}

module.exports = repairAuthHolder;