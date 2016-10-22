'use strict'
var alasql = require('alasql')

function init (config, laContext, eventEmitter) {
  // create timer if it does not exist
  if (config.timerFunc !== undefined) {
    return
  }
  // helper funtion to run the query once per interval
  var queryRunner = function () {
    for (var buf in config.buffer) {
      runQueries(buf, config, eventEmitter)
    }
  }
  config.timerFunc = setInterval(queryRunner, (config.interval * 1000) || 1000)
}

function runQueries (buf, cfg, eventEmitter) {
  var tmpData = cfg.buffer[buf]
  if (tmpData) {
    for (var q in tmpData.queries) {
      var result = tmpData.queries[q]([tmpData.data])
      if (result && result.length) {
        // emit events to output modules, listening for "data.parsed" events
        for (var i = 0; i < result.length; i++) {
          eventEmitter.emit('data.parsed', result[i], cfg.buffer[buf].context)
        }
      } else {
        if (result) {
          eventEmitter.emit('data.parsed', result, cfg.buffer[buf].context)
        }
      }
      tmpData.data = null
    }
    cfg.buffer[buf] = null
  }
}
// buffer logs per source to run SQL queries on it
function bufferEvents (context, config, data) {
  if (!config.buffer) {
    config.buffer = {}
  }
  if (!config.buffer[context.logSource]) {
    config.buffer[context.logSource] = {
      data: [],
      context: context,
      queries: []
    }
    for (var c in config.queries) {
      var queryStr = config.queries[c]
      try {
        var query = alasql.compile(queryStr)
        config.buffer[context.logSource].queries.push(query)
      } catch (err) {
        console.log('Error in sql output filter:', err.message)
      }
    }
  }
  config.buffer[context.logSource].data.push(data)
}

function sqlFilter (context, config, eventEmitter, data, callback) {
  if (data == null) {
    return callback(new Error('data is null'), null)
  }
  // console.log(arguments)
  if (config.source.test(context.sourceName)) {
    init(config, context, eventEmitter)
    bufferEvents(context, config, data)
    // drop single events, we will generate one event per interval
    callback(new Error('droped event for aggregation'), null)
  } else {
    // pass data of other log sources, to be handled by other filters
    callback(null, data)
  }
}
module.exports = sqlFilter
