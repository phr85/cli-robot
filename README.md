# epha-robot

robot is a tool (entirely written in [node.js](https://nodejs.org/)) for fetching, purifying and transforming pharmaceutical (csv, xlsx, xml, zip) into machine readable (JSON, csv) data. 

robot uses public resources like [swissmedic - Product information](http://download.swissmedicinfo.ch/Accept.aspx?Lang=EN) and is meant to be as a starting point for studies, thesis and further processing and purifying of the data.

## Table of contents

[Benefits](#Benefits) - [Jobs](#Jobs) - [Install](#Install_robot) - [Usage](#Usage) - [Development](#Development)

## Benefits

- reliable and smart fetching of pharmaceutical data
- auto-transformation into JSON-files: for example from xlsx-files
- supports the following data/sources:
  - [ATC - Official ATC-Index (WidO)](http://wido.de/amtl_atc-code.html) 
  - [BAG - Federal Office of Public Health FOPH](http://www.spezialitaetenliste.ch/)
  - [swissmedic - Human and veterinary medicines](https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html?lang=en) 
  - [kompendium - Pharmaceutical Product Information](http://download.swissmedicinfo.ch/Accept.aspx?ReturnUrl=%2f)

## Jobs

### atc

This job generate a map of *Acute Toxic Class*-data.

**Downloads**

  - location: `{PROCESS_ROOT}/data/auto/atc`
  - `atc.zip` (> 4.5MB) containing atc.xlsx

**Releases**

  - location: `{PROCESS_ROOT}/data/release/atc`
  - `atc.csv` 
  - `atc.json`
  - `atc.min.json`  

**atc.json - Sample:**

```javascript
//..
   "A01AA51": {
      "name": "Natriumfluorid, Kombinationen"
   },
   "A01AB": {
      "name": "Antiinfektiva und Antiseptika zur oralen Lokalbehandlung"
   },
   "A01AB02": {
      "name": "Wasserstoffperoxid",
      "ddd": "60 mg O"
   },
//..   
```

### bag

**Downloads**

- location: `{PROCESS_ROOT}/data/auto/bag/`
-  `XMLPublications.zip` (~ 5MB)
-  containing: `bag.xls`, `bag.xml`, `it.xml`

**Releases**

- location: `{PROCESS_ROOT}/data/release/bag/`
- `bag.json`
- `bag.min.json`
- `bag.history.json`
- `bag.history.min.json`
- `it.json`
- `it.min.json`

**bag.json - Sample:**

```javascript
// ...
   {
      "name": "3TC",
      "atc": "J05AF05",
      "description": "Filmtabl 150 mg",
      "orgGenCode": "O",
      "flagSB20": "N",
      "vatInEXF": "N",
      "substances": [
         {
            "name": "Lamivudinum",
            "quantity": "150",
            "quantityUnit": "mg"
         }
      ],
      "packung": "60 Stk",
      "flagNarcosis": "N",
      "bagDossier": "16577",
      "gtin": "7680536620137",
      "exFactoryPreis": "164.55",
      "exFactoryPreisValid": "01.10.2011",
      "publikumsPreis": "205.30",
      "publikumsPreisValid": "01.10.2011",
      "validFrom": "15.03.1996"
   },
//...   
```

#### bagHistory(-job)
In `bag.history.json` the job keeps automatically track of de-registered products and price changes. This file will be automatically created after the first run (contents will be equal to `bag.history.json`). Deleting this file is the same as restarting the history. Probably it is necessary for you to backup this file

**bag.history.json - Sample:**

```javascript
      //...
      "publikumsPreisHistory": [
         // history-entity
         {
            "dateTime": "08.06.2015 17:09", // time of change
            "publikumsPreis": [
               "205.30", //before
               "300.00"  //after
            ],
            "publikumsPreisValid": [
               "01.10.2011", //before
               "08.06.2015" //after
            ]
         }
         // ..
      ]
      //...
```

### kompendium:
The **kompendium**-job fetches a huge catalog of pharmaceutical product information and is also quite time and resource consuming. The downloaded file itself has around 190MB (>800MB unzipped). The job will also build a huge amount of .htm-files (~25000) containing product specific and patient related information in German, French and Italian (if available).

**Downloads**

- `{PROCESS_ROOT}/data/auto/kompendium/kompendium.zip` (190MB)
- containing `{PROCESS_ROOT}/data/auto/kompendium/kompendium.xml` (~850MB) 

**Releases**

- location: `{PROCESS_ROOT}/data/release/kompendium`
- `kompendium.json`
- `kompendium.min.json`
- `catalog.json`

**kompendium.json - Sample:**

```javascript
{
  "documents": [
    // ...
    {
      "zulassung": "10167",
      "lang": "de fr it",
      "type": "fi pi",
      "produkt": "Emser Salz®",
      "substanz": "Emser Salz",
      "hersteller": "Sidroga AG",
      "atc": "RO2AX",
      "files": [
        //language/type/zulassung.htm
        "de/fi/10167.htm",
        "fr/fi/10167.htm",
        "de/pi/10167.htm",
        "fr/pi/10167.htm",
        "it/pi/10167.htm"
      ]
    }
    // ...
  ]
}
```

### swissmedic:
This job fetches data about human and veterinary medicines. It also creates a history-file and triggers the **atc**-Job if required.

#### atc/CH
When there is no **atc**-Release available it auto-runs the **atc**-Job as it is a dependency for **atcCH**. *Please note* that if there is an **atc**-Release available it will use it. This release could be potentially *out-of-date*. So it is up to the user to run **atc**-Job if necessary.

#### swissmedicHistory(-job)
There will be also a `swissmedic.history.json` which keeps track of de-registered products. This file will be automatically created after the first run (contents will be equal to `swissmedic.json`). Deleting this file is the same as restarting the history. Probably it is necessary for you to backup this file.

**Downloads**

- atc (as a side effect)
  - location: `{PROCESS_ROOT}/data/release/atc`
  - `atc.zip` (> 4.5MB), containing `atc.xlsx`

- swissmedic:
  - location: `{PROCESS_ROOT}/data/auto/swissmedic/`
  - `swissmedic.xlsx` (> 2.5MB)

**Releases**

- atc
  - location: `{PROCESS_ROOT}/data/release/atc`
  - `atc_de-ch.json`
  - `atc_de-ch.min.json` 
  - as a side effect
     - (`atc.csv`) 
     - (`atc.json`)
     - (`atc.min.json`)

- swissmedic:
  - location: `{PROCESS_ROOT}/data/release/swissmedic/`
  - `swissmedic.json`
  - `swissmedic.min.json`
  - `swissmedic.history.json`
  - `swissmedic.history.min.json`

## Install robot

### Requirements

- node.js >= v0.12.x ([Installing information]((https://github.com/joyent/node/wiki/Installation)))
- npm > 2.7.x (usually shipped with node.js)

### Installation

```shell
npm install epha-robot
```

## Usage

### CLI
```bash
npm start
> epha-robot@0.2.15 start
> node ./bin/cli.js
EMIL: I'm ready, if you are? Type help for help.
> help
EMIL: You can add jobs to the queue e.g.
EMIL: 'atc' << Codes & DDD
EMIL: 'bag' << Spezialitätenliste
EMIL: 'kompendium' << Swissmedic Kompendium
EMIL: 'swissmedic' << Registered products CH
EMIL: and then run queue with 'go'
EMIL: I'm ready, if you are? Type help for help.
> 
```

### Programmatical

#### callbacks
```javascript
var swissmedicJob = require('epha-robot').swissmedic;

swissmedicJob(function(err) {
  if (err) {
    throw err;
  }
  console.log("Downloaded, parsed and saved swissmedic file");
});
```

#### Promises
```javascript
var robot = require("epha-robot");
var disk = require("epha-robot").disk;
var kompendiumJob = robot.kompendium;
var kompendiumCfg = robot.kompendium.cfg;

kompendiumJob()
    .then(function () {
      return disk.read.json(kompendiumCfg.process.file);
    })
    .then(function (data) {
      // do something with data
    })
    .catch(function (err) {
      console.error("OH NO!", err.message, err.stack);
    });
```

### npm scripts

```shell
npm run all
npm run outdated
npm run robot-service

```

## Development

### Tests

#### Unit-Tests

- `npm test`: Runs the unit-tests once
- `npm run watch-test`: Watches project's files and re-runs unit-tests on change
- both support growling. check [tj/node-growl](https://github.com/tj/node-growl) to enable it on your machine.

#### Integration-Tests

- `npm run test-integration`
  1. Run `npm run init-test-integration` which will download fresh data to `{ROOT}/data/auto` & `{ROOT}/data/release` and copies it to `{ROOT}/fixtures` to use it as fixtures
  2. Spins up a real node http-server that serves atc, swissmedic etc. dummy sites and downloads.
  3. It runs each job against the integration-testing-server and tests the whole flow from html parsing to creating release files.