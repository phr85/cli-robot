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