## find-wikidata-items
Uses query.wikidata.org to retrieve lists of items from Wikidata

### Usage
```js
const findWikidataItems = require('find-wikidata-items')
global.fetch = require('node-fetch') // only needed when run from NodeJS

findWikidataItems(
  [
    { P50 : 'Q42' } // author (P50) is Douglas Adams (Q42)
  ],
  (err, result) => {
    console.log(result)
  }
)
```

Result:
```json
[
  {
    "Q721": {},
    "Q25169": {},
    "Q187655": {},
    "Q280418": {},
    ...
  }
]
```

## API

findWikidataItems(query, options, callback)
