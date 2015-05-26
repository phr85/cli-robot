"use strict";

function repairSubstances(raw) {
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

module.exports = repairSubstances;