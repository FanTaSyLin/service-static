const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const NotFoundError = require('./lib/not-found-error.js')

module.exports = function (CONFIG) {
  let app = express()
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json({ limit: '50mb' }))
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
    )
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header('X-Powered-By', '3.2.1')
    if (req.method === 'OPTIONS') {
      res.send(200) // 让options请求快速返回
    } else {
      next()
    }
  })

  // =======================此处引入自己的路由文件======================
  app.use('/static-serve', require('./route/static-serve-handler.js')(CONFIG['static-serve']['root']))
  // ==================================================================

  app.use('*', function (req, res, next) {
    next(new NotFoundError('404'))
  })

  app.use(function (err, req, res) {
    let code = 500
    let msg = err.stack || {
      message: 'Internal Server Error 1'
    }
    switch (err.name) {
      case 'NotFoundError':
        code = err.status
        msg = err.inner
        break
      default:
        break
    }
    return res.status(code).json(msg)
  })
  return app
}
