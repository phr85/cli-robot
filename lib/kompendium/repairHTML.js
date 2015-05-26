"use strict";

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
}

module.exports = repairHTML;