const express = require('express')
const bodyParser = require('body-parser')
const ServiceInnerErr = require('./lib/service-inner-error')
module.exports = function (CONFIG) {
  const app = express()
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
  app.use('/service/static', require('./route/static-serve-handler.js')())
  // ==================================================================

  app.use('*', function (req, res, next) {
    res.status(404).end()
  })

  app.use(function (err, req, res) {
    const shkErr = new ServiceInnerErr(err)
    return res.status(shkErr.code).json(shkErr.inner)
  })
  return app
}
