# epha-robot

robot is a tool (entirely written in [node.js](https://nodejs.org/)) for fetching, purifying and transforming pharmaceutical (csv, xlsx, xml, zip) into machine readable (JSON, csv) data. 

robot uses public resources like [swissmedic - Product information](http://download.swissmedicinfo.ch/Accept.aspx?Lang=EN) and is meant to be as a starting point for studies, thesis and further processing and purifying of the data.

## Table of contents

[Benefits](#benefits) - [Jobs](#jobs) - [Install](#install-robot) - [Usage](#usage) - [Development](#development)

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

This job generates a map of *Acute Toxic Class*-data.

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

Gets a collection of pharmaceutical products incl. prices.

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
In `bag.history.json` the job keeps automatically track of de-registered products and price changes. This file will be automatically created after the first run (at this moment contents will be equal to `bag.history.json`). Deleting this file is the same as restarting the history. Probably it is necessary - especially bevor un-installing/removing robot - to backup this file from time to time.

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

#### bag-logs

Additionally to the history-file, logs for *new*, *changed* and *de-registered* products will be written:

- location: `{PROCESS_ROOT}/logs/bag/`
- `bag.changes.log`
- `bag.new.log`
- `bag.de-registered.log` 

It could be very handy to use `tail -f` on this logs.

### kompendium:
The **kompendium**-job fetches a huge catalog of pharmaceutical product information and is also quite time and resource consuming. The downloaded file itself has around 190MB (> 800MB unzipped). The job will also build a huge amount of .htm-files (~25000) containing product specific and patient related information in German, French and Italian (if available).

**Downloads**

- `{PROCESS_ROOT}/data/auto/kompendium/kompendium.zip` (190MB)
- containing `{PROCESS_ROOT}/data/auto/kompendium/kompendium.xml` (~850MB) 

**Releases**

- locations: 
  - `{PROCESS_ROOT}/data/release/kompendium`
     - `kompendium.json`
     - `kompendium.min.json`
     - `catalog.json`
  - German FI/PI: `{PROCESS_ROOT}/data/release/kompendium/de/`
     - `fi/{REGISTRATION_NUMMBER}.htm`
     - `pi/{REGISTRATION_NUMMBER}.htm`
  - French FI/PI: `{PROCESS_ROOT}/data/release/kompendium/fr/`
     - `fi/{REGISTRATION_NUMMBER}.htm`
     - `pi/{REGISTRATION_NUMMBER}.htm`
  - Italian FI/PI: `{PROCESS_ROOT}/data/release/kompendium/it/`
     - `fi/{REGISTRATION_NUMMBER}.htm`
     - `pi/{REGISTRATION_NUMMBER}.htm`

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
        //language/type/{REGISTRATION_NUMMBER}.htm
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
There will be also a `swissmedic.history.json` which keeps track of de-registered products. This file will be automatically created after the first run (at that moment contents will be equal to `swissmedic.json`). Deleting this file is the same as restarting the history. De-registered products will be flagged with `{ "deregistered": "DD.MM.YYYY" }`. Please note: Before re-installing robot it is advisible to backup this file.

#### swissmedic-logs

Like **bag** there will be logs for *new*, *changed* and *de-registered* products:

- location: `{PROCESS_ROOT}/logs/swissmedic/`
- `swissmedic.changes.log`
- `swissmedic.new.log`
- `swissmedic.de-registered.log` 

Think of `tail -f`, it might be useful.

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

**swissmedic.json - Sample**

```javascript
//..
   {
      "zulassung": "00277",
      "sequenz": "1",
      "name": "Coeur-Vaisseaux Sérocytol, suppositoire",
      "hersteller": "Sérolab, société anonyme",
      "itnummer": "08.07.",
      "atc": "J06AA",
      "heilmittelcode": "Blutprodukte",
      "erstzulassung": "26.4.2010",
      "zulassungsdatum": "26.4.2010",
      "gueltigkeitsdatum": "25.4.2020",
      "verpackung": "001",
      "packungsgroesse": "3",
      "einheit": "Suppositorien",
      "abgabekategorie": "B",
      "wirkstoffe": "globulina equina (immunisé avec coeur, endothélium vasculaire porcins)",
      "zusammensetzung": "globulina equina (immunisé avec coeur, endothélium vasculaire porcins) 8 mg, propylenglycolum, conserv.: E 216, E 218, excipiens pro suppositorio.",
      "anwendungsgebiet": "Traitement immunomodulant selon le Dr Thomas\r\n\r\nPossibilités d'emploi voir information professionnelle",
      "gtin": "7680002770014"
   },
//..   
```  

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

### npm scripts

#### robot-service

```shell
npm run robot-service
```

Probably the most common use-case for robot: runs **outdated** each 30 minutes (default). It is possible to adjust re-run-time by passing `DELAY={OTHER_VALUE}` (milliseconds). `DELAY` should depend on your internet connection and cpu power.

**Example:**

`DELAY=60000 npm run robot-service` will run *outdated* **every hour**.
 
Will only exit manually or when it crashes. Log level is reduced to *warnings* and *errors*. 
It could be quite useful running the underlying script (`bin/outdated`) with a daemon like [forever](https://www.npmjs.com/package/forever), [pm2](https://www.npmjs.com/package/pm2) so that it will automatically restart if it crashes (which shouldn't happen).

#### start

```shell
npm start
```

Starts the robot-[cli](#cli).

#### all

```shell
npm run all
```

Runs all jobs (atc, bag, kompendium, swissmedic) in parallel. Useful with a broadband internet connection and powerful cpu to get as fast as possible the current state. Exists when done or fails. Will overwrite/updates existing files.


#### outdated
```shell
npm run outdated
```
Checks sources on changes by header-`content-length`. If `content-length` diffs to file-size on disk it will trigger appropriate job. Runs jobs in sequence and exits when is done or fails.

### Programmatical

#### Promises
```javascript
var robot = require("epha-robot");
var disk = require("epha-robot").common.disk;
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

## Development

### job-configs

Each job has it's own config file. However there is a convention for configs:

```javascript
/* any config file*/

// Will resolve paths according to {PROCESS_ROOT}
var config = require("lib/common/config");

module.exports = config("anyJobName", {
  "download": {
    "url": "..."
    "linkParser": /RegExp/i
    "zipFiles": [{name: /RegExpForFileInZip/, dest: }]
  },
  "manual": {
    //optional
  },
  "release": {
    "file": "anyJobName.json" // will resolve to {PROCESS_ROOT}/data/anyJobName/release/anyJobName.json
    "minFile": "anyJobName.min.json",
  },
  "history": {
    //optional
  },
  "log": {
    //optional
  }
});
```

### creating a history file

Basically it should be possible to create for each release a history-file by using `history`-lib if

- the release is a JSON-collection. 
- each collection entry has a key `gtin` that identifies this entry

```javascript
/* history job for anyJob */

var history = require("lib/history/history"); 

var cfg = require("jobs/cfg/anyJobCfg");

/**
 * Pass a logger if default-logger doesn't fit with your desired log-level, but it is optional
 * History returns a Promise.
 */
function anyJobHistory(log) {

  // will be called if a change was detected.
  // passes references to currently processed history- and newData entry
  function onChanged(diff, historyData, newData) {
    // do something fancy, a good example mighty be jobs/bagHistory.js
  } 

  // cfg must contain information about where to put history- and log-files
  return history("anyJob", cfg, onChanged, log);
}

module.exports = anyJobHistory;

```
### Tests

#### Unit-Tests

- `npm test`: Runs the unit-tests once
- `npm run watch-test`: Watches project's files and re-runs unit-tests on change
- both support growling. check [tj/node-growl](https://github.com/tj/node-growl) to enable it on your machine.

#### Integration-Tests

`npm run test-integration`

  1. Run `npm run init-test-integration` which will download fresh data to `{ROOT}/data/auto` & `{ROOT}/data/release` and copies it to `{ROOT}/fixtures` to use it as fixtures
  2. Spins up a real node http-server that serves atc, swissmedic etc. dummy sites and downloads.
  3. It runs each job against the integration-testing-server and tests the whole flow from html parsing to creating release files.
