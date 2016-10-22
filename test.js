var sqlFilter = require('./index.js')
function test (done) {
  // simualte Logagent config object
  var config = {
    source: /.*/,
    interval: 5,
    queries: ['SELECT COUNT(status) AS status_count,status FROM ? group by status']
  }
  // simulate event contect
  var context = {logSource: 'nginx'}

  // simulate logagent eventEmitter
  var eventEmitter = eventEmitter = new (require('events')).EventEmitter()
  eventEmitter.on('data.parsed', function (payload) {
    console.log(new Date(), payload)
  })
  // generate data
  for (var i = 0; i < 100; i++) {
    var data = {status: 400, path: '/'}
    data.status = data.status + (i % 2)
    // console.log(data)
    sqlFilter(context, config, eventEmitter, data, function () {})
  }
}
test()
// setTimeout(console.log, 30000)
