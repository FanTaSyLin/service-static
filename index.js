const CONFIG = require('./lib/config.js')(__dirname, 'Service-Static')

const app = require('./service.js')()

app.listen(CONFIG.port, function () {
  console.log('HTTP Server listening on port: %s, in %s mode', CONFIG.port, app.get('env'))
})
