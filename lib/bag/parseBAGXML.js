"use strict";

var fs = require("fs");

var splitter = require('xml-splitter');

var util = require("../common/util");
var defaultLog = require("../").log;

/**
 *
 * @param {String} bagXMLFile
 * @returns {Promise}
 */
function parseBAGXML(bagXMLFile, log) {

  log = log || defaultLog;

  return new Promise(function (resolve, reject) {
    var xs = new splitter('/Preparations/Preparation');

    var errorGtin = [];
    var errorDossier = [];
    var error13974 = [];

    var cleaned = [];

    xs.on('data', function(data)
    {
      // DEBUG
      // console.log( data );

      var clean = Object.create(null);

      if( data.NameDe && data.NameDe.$t ) clean.name = data.NameDe.$t.trim();
      if( data.AtcCode && data.AtcCode.$t) clean.atc = data.AtcCode.$t.trim();
      if( data.DescriptionDe && data.DescriptionDe.$t ) clean.description = data.DescriptionDe.$t.trim();
      if( data.OrgGenCode && data.OrgGenCode.$t ) clean.orgGenCode = data.OrgGenCode.$t.trim();

      clean.flagSB20 = data.FlagSB20.$t.trim();
      clean.vatInEXF = data.VatInEXF.$t.trim();

      // GENERAL LIMITATIONS
      if( data.Limitations && data.Limitations.Limitation)
      {
        if( !data.Limitations.Limitation.length ) data.Limitations.Limitation = [ data.Limitations.Limitation ];

        data.Limitations.Limitation.forEach( function( element )
        {
          var limitation =
          {
            code: element.LimitationCode.$t,
            type: element.LimitationType.$t,
            niveau: element.LimitationNiveau.$t,
            name: element.DescriptionDe.$t,
            valid: element.ValidFromDate$t,
            //validUntil: toParse[i].Limitations[0].Limitation[0].ValidThruDate[0]
          };

          if( element.LimitationValue )
            limitation.value = element.LimitationValue.$t;

          if( !clean.limitations ) clean.limitations = [];

          clean.limitations.push( limitation );
        });
      }

      // GENERAL LIMITATIONS IN IT
      if( data.ItCodes && data.ItCode)
      {
        var codes = data.ItCodes.ItCode;

        for( var j = 0; j < codes.length; j++)
        {
          var itCode = clean.itCode || "";

          if( codes[j].Code.length > itCode.length )
          {
            clean.itCode = codes[j].Code;
            clean.itName = codes[j].DescriptionDe.$t;
          }

          if( codes[j].Limitations && codes[j].Limitations.Limitation)
          {
            if( !codes[j].Limitations.Limitation.length ) codes[j].Limitations.Limitation = [ codes[j].Limitations.Limitation ];

            codes[j].Limitations.Limitation.forEach( function( element )
            {
              var limitation =
              {
                code: element.LimitationCode.$t,
                type: element.LimitationType.$t,
                niveau: element.LimitationNiveau.$t,
                name: element.DescriptionDe.$t,
                valid: element.ValidFromDate$t,
                //validUntil: toParse[i].Limitations[0].Limitation[0].ValidThruDate[0]
              };

              if( !clean.limitations ) clean.limitations = [];

              clean.limitations.push( limitation );
            });
          }
        }
      }

      // Substances
      if( data.Substances && data.Substances.Substance)
      {
        if(! data.Substances.Substance.length ) data.Substances.Substance = [data.Substances.Substance];

        data.Substances.Substance.forEach( function( element )
        {
          var substance =
          {
            name: element.DescriptionLa.$t,
            quantity: element.Quantity.$t,
            quantityUnit: element.QuantityUnit.$t
          };

          if( ! clean.substances ) clean.substances = [];

          clean.substances.push( substance );
        });
      }

      if( !data.Packs.Pack.length ) data.Packs.Pack = [data.Packs.Pack];

      // ITERATE PACKUNGS ARRAY
      for( var x = 0; x < data.Packs.Pack.length; x++ )
      {
        var cleanEachItem = Object.create( null );
        // COPY THINGS SOFAR
        for( var attr in clean ) cleanEachItem[attr] = clean[attr];

        cleanEachItem.pharmacode = data.Packs.Pack[x].Pharmacode;
        cleanEachItem.packung = data.Packs.Pack[x].DescriptionDe.$t.trim();
        cleanEachItem.flagNarcosis = data.Packs.Pack[x].FlagNarcosis.$t.trim();

        //DOES NOT MAKE SENSE
        //clean.flagModal = data.Packs.Pack[x].$t.FlagModal;

        // REQUIRED FIELD
        if( !data.Packs.Pack[x].BagDossierNo )
        {
          errorDossier.push( cleanEachItem.name );
          cleanEachItem.bagDossier = "";
        }
        else cleanEachItem.bagDossier = data.Packs.Pack[x].BagDossierNo.$t;

        if( data.Packs.Pack[x].GTIN ) cleanEachItem.gtin = data.Packs.Pack[x].GTIN.$t;

        if( !cleanEachItem.gtin && data.Packs.Pack[x].SwissmedicNo8 )
        {
          // GTIN RECOVERING
          cleanEachItem.gtin = "7680" + ("00000000" + data.Packs.Pack[x].SwissmedicNo8.$t ).slice(-8);
          cleanEachItem.gtin += util.eanCheckDigit(cleanEachItem.gtin);
        }

        // LIMITATIONS FOR THIS PACK
        if( data.Packs.Pack[x].Limitations && data.Packs.Pack[x].Limitations.Limitation )
        {
          if( !data.Packs.Pack[x].Limitations.Limitation.length ) data.Packs.Pack[x].Limitations.Limitation = [ data.Packs.Pack[x].Limitations.Limitation ];

          data.Packs.Pack[x].Limitations.Limitation.forEach( function( element )
          {
            var limitation =
            {
              code: element.LimitationCode.$t,
              type: element.LimitationType.$t,
              niveau: element.LimitationNiveau.$t,
              name: element.DescriptionDe.$t,
              valid: element.ValidFromDate$t,
              //validUntil: toParse[i].Limitations[0].Limitation[0].ValidThruDate[0]
            };

            if( !cleanEachItem.limitations ) cleanEachItem.limitations = [];

            cleanEachItem.limitations.push( limitation );
          });
        }

        // LIMITATIONS POINT FOR THIS PACK
        if( data.Packs.Pack[x].PointLimitations && data.Packs.Pack[x].PointLimitations.PointLimitation)
        {
          if( !data.Packs.Pack[x].PointLimitations.PointLimitation.length ) data.Packs.Pack[x].PointLimitations.PointLimitation = [ data.Packs.Pack[x].PointLimitations.PointLimitation ];

          data.Packs.Pack[x].PointLimitations.PointLimitation.forEach( function( element )
          {
            var pointLimitation = {};
            if( element.Points && element.Points.$t ) pointLimitation.punkte = element.Points.$t;
            if( element.Packs && element.Packs.$t ) pointLimitation.packs = element.Packs.$t;
            if( element.Points.$t ) pointLimitation.wert = element.Points.$t;
            if( element.ValidFromDate.$t ) pointLimitation.valid =element.ValidFromDate.$t;
            //if( toParse[i].Packs[0].Pack[0].PointLimitations[0].PointLimitation[0].ValidFromDate[0] )
            //punkte.validThru = toParse[i].Packs[0].Pack[0].PointLimitations[0].PointLimitation[0].ValidThruDate[0];

            if( !cleanEachItem.limitationsPunkte ) cleanEachItem.limitationsPunkte = [];

            cleanEachItem.limitationsPunkte.push( pointLimitation );
          });
        }

        // PRICE PRO PACKUNG
        if( data.Packs.Pack[x].Prices.ExFactoryPrice && data.Packs.Pack[x].Prices.ExFactoryPrice.Price && data.Packs.Pack[x].Prices.ExFactoryPrice.Price.$t)
        {
          var weirdExFactory = data.Packs.Pack[x].Prices.ExFactoryPrice.Price.$t;

          var franken = weirdExFactory.split(".")[0];
          var rappen = weirdExFactory.split(".")[1] || "";

          rappen = ( rappen + "00" ).slice(0,2);

          cleanEachItem.exFactoryPreis = franken + "." + rappen;
          cleanEachItem.exFactoryPreisValid = data.Packs.Pack[x].Prices.ExFactoryPrice.ValidFromDate.$t;
        }

        if( data.Packs.Pack[x].Prices.PublicPrice && data.Packs.Pack[x].Prices.PublicPrice.Price && data.Packs.Pack[x].Prices.PublicPrice.Price.$t)
        {
          var weirdPubPreis = data.Packs.Pack[x].Prices.PublicPrice.Price.$t;

          var franken = weirdPubPreis.split(".")[0];
          var rappen = weirdPubPreis.split(".")[1] || "";

          rappen = ( rappen + "00" ).slice(0,2);

          cleanEachItem.publikumsPreis = franken + "." + rappen;
          cleanEachItem.publikumsPreisValid = data.Packs.Pack[x].Prices.PublicPrice.ValidFromDate.$t;
        }

        //clean.integration = toParse[i].Packs[0].Pack[0].Status[0].IntegrationDate[0];
        cleanEachItem.validFrom = data.Packs.Pack[x].Status.ValidFromDate.$t;
        //clean.validThru = toParse[i].Packs[0].Pack[0].Status[0].ValidThruDate[0];
        //clean.typeCode = toParse[i].Packs[0].Pack[0].Status[0].StatusTypeCodeSl[0];
        //clean.type = toParse[i].Packs[0].Pack[0].Status[0].StatusTypeDescriptionSl[0];
        //clean.apd = toParse[i].Packs[0].Pack[0].Status[0].FlagApd[0];

        // PUSH PRO PACKUNG
        if( cleanEachItem.bagDossier === "13974" ) error13974.push( cleanEachItem.name );

        else if( !cleanEachItem.gtin || cleanEachItem.gtin.length != 13 ) errorGtin.push( cleanEachItem.name );

        else cleaned.push( cleanEachItem );
      }
      // END ITERATRING PACKUNGS ARRAY
    });

    xs.on("error", reject);

    xs.on('end', function(counter)
    {
      log.warn("BAG", "Removed with no gtin", { elements:errorGtin.length });
      //console.log( errorGtin.join(", ") );
      log.warn( "BAG", "Removed weird dossier", { elements: error13974.length });
      //console.log( error13974.join(", ") );
      log.warn( "BAG", "No bag dossier", {elements: errorDossier.length });
      //console.log( errorDossier.join(", ") );
      //SUMMARY
      log.debug( "BAG", "Summary", { products:counter, cleaned: cleaned.length });
      resolve( cleaned );
    });

    var stream = fs.createReadStream(bagXMLFile, { start:3 });

    xs.parseStream( stream );
  });
}

module.exports = parseBAGXML;