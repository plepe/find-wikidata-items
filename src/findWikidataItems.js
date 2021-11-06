function wikidataRun (str, options, callback) {
  global.fetch('https://query.wikidata.org/sparql?query=' + encodeURIComponent(str),
    {
      headers: {
        // lower case to avoid forbidden request headers, see:
        // https://github.com/ykzts/node-xmlhttprequest/pull/18/commits/7f73611dc3b0dd15b0869b566f60b64cd7aa3201
        'user-agent': 'wikipedia-list-extractor',
        accept: 'application/json'
      },
      responseType: 'json'
    })
    .then(response => response.json())
    .then(result => callback(null, result))
    .catch(err => global.setTimeout(() => callback(err), 0))
}

module.exports = function findWikidataItems (queries, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  let query = []
  const properties = {}
  const finalResult = new Array(queries.length)

  if (queries.length === 0) {
    return callback(null, [])
  }

  queries.forEach(q => {
    let subQuery = '{'

    for (const k in q) {
      properties[k] = true

      if (q[k].match(/^Q[0-9]+$/)) {
        subQuery += '?item wdt:' + k + ' wd:' + q[k] + '.\n?item wdt:' + k + ' ?' + k + '.\n'
      } else {
        subQuery += '?item wdt:' + k + ' "' + q[k] + '".\n?item wdt:' + k + ' ?' + k + '.\n'
      }
    }

    subQuery += '}'

    query.push(subQuery)
  })

  query = 'SELECT ?item ' + Object.keys(properties).map(p => '?' + p).join(' ') + ' WHERE {' + query.join('\nunion') + '}'

  const _options = JSON.parse(JSON.stringify(options))
  _options.properties = Object.keys(properties)

  wikidataRun(query, _options,
    (err, _result) => {
      if (err) { return callback(err) }

      const result = _result.results.bindings
      result.forEach(item => {
        const id = item.item.value.match(/(Q[0-9]+)$/)[1]
        delete item.item

        queries.forEach((q, index) => {
          const matches = Object.keys(q).filter(k => {
            if (!(k in item)) {
              return false
            }

            let value = item[k].value
            if (item[k].type === 'uri') {
              value = item[k].value.match(/(Q[0-9]+)$/)[1]
            }

            return q[k] === value
          })

          if (!matches.length) {
            return
          }

          if (!finalResult[index]) {
            finalResult[index] = {}
          }

          finalResult[index][id] = {}
        })
      })

      callback(null, finalResult)
    }
  )
}
