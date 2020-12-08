const express = require('express')
const bodyParser = require('body-parser')
module.exports = function (CONFIG) {
  const app = express()
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json({ limit: '50mb' }))
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
    )
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header('X-Powered-By', '3.2.1')
    res.header('Access-Control-Allow-Credentials', 'true')
    if (req.method === 'OPTIONS') {
      res.send(200) // 让options请求快速返回
    } else {
      next()
    }
  })

  // =======================此处引入自己的路由文件======================
  app.use('/service/static', require('./route/other-handler.js')())
  app.use('/service/static', require('./route/static-serve-handler.js')())
  app.use('/service/upload', require('./route/upload-handler')())
  // ==================================================================

  app.use('*', function (req, res, next) {
    res.status(404).end()
  })

  app.use(function (err, req, res, next) {
    switch (err.code) {
      case 'ENOENT':
        return res.status(404).json(err)
      default:
        return res.status(500).json(err)
    }
  })
  return app
}
