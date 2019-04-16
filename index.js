const configCtrl = require('./lib/config-ctrl.js')
const CONFIG = configCtrl(__dirname)

const app = require('./app.js')(CONFIG)

app.listen(CONFIG['static-serve'].port, function () {
  console.log('HTTP Server listening on port: %s, in %s mode', CONFIG['static-serve'].port, app.get('env'))
})
