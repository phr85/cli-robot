# epha-robot

robot is a tool (entirely written in [node.js](https://nodejs.org/)) for fetching, purifying and transforming pharmaceutical (csv, xlsx, xml, zip) into machine readable (JSON, csv) data. 

robot uses public resources like [swissmedic - Product information](http://download.swissmedicinfo.ch/Accept.aspx?Lang=EN) and is meant to be a starting point for studies, thesis and further processing.

## Benefits

- reliable and smart fetching of pharmaceutical data
- auto-transformation into JSON-files: for example from xlsx-files
- supports the following data/sources:
  - [ATC - Official ATC-Index (WidO)](http://wido.de/amtl_atc-code.html) 
  - [BAG - Federal Office of Public Health FOPH](http://www.spezialitaetenliste.ch/)
  - [swissmedic - Human and veterinary medicines](https://www.swissmedic.ch/arzneimittel/00156/00221/00222/00230/index.html?lang=en) 
  - [kompendium - Pharmaceutical Product Information](http://download.swissmedicinfo.ch/Accept.aspx?ReturnUrl=%2f)

## Install robot

### Requirements

- node.js >= v0.12.x ([Installing information]((https://github.com/joyent/node/wiki/Installation)))
- npm > 2.7.x (usually shipped with node.js)

### Installation

```shell
npm install epha-robot
```

## Usage

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