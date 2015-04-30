# robot
Fetching, cleaning, transforming of pharmaceutical data from public resources

## Usage CLI
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

## Usage module
```javascript
var bot = require('epha-robot');

bot.swissmedic( function() {
  console.log("Downloaded, parsed and saved swissmedic file");
});
```

## Tests

### Unit-Tests

- `npm test`: Runs the unit-tests once
- `npm run watch-test`: Watches project's files and re-runs unit-tests on change
- both support growling. check [tj/node-growl](https://github.com/tj/node-growl) to enable it on your machine.

### Integration-Tests

#### `npm run test-integration`

1. Spins up a real node http-server that serves atc, swissmedic etc. dummy sites and downloads.
2. It runs each job (currently atc, swissmedic) against the server and tests the whole flow from html parsing to creating release files.