const fs = require('fs')
const path = require('path')
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
const CONFIG = require('./lib/config')()
module.exports = function () {
  const app = express()
  app.use(compression())
  app.use('/public', express.static(path.join(__dirname, './public')))
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
    let htmlStr = fs.readFileSync(path.join(__dirname, '404.html'), 'utf-8')
    htmlStr = htmlStr.replace('$$VERSION$$', getVersion())
    htmlStr = htmlStr.replace('$$PORT$$', CONFIG.port)
    res.set('Content-Type', 'text/html')
    res.status(404).send(htmlStr)
    // res.status(404).send('../404.html')
  })

  app.use(function (err, req, res, next) {
    switch (err.code) {
      case 'ENOENT':
        return (() => {
          let htmlStr = fs.readFileSync(path.join(__dirname, '404.html'), 'utf-8')
          htmlStr = htmlStr.replace('$$VERSION$$', getVersion())
          htmlStr = htmlStr.replace('$$PORT$$', CONFIG.port)
          res.set('Content-Type', 'text/html')
          res.status(404).send(htmlStr)
        })()
      default:
        return (() => {
          let htmlStr = fs.readFileSync(path.join(__dirname, '500.html'), 'utf-8')
          htmlStr = htmlStr.replace('$$VERSION$$', getVersion())
          htmlStr = htmlStr.replace('$$PORT$$', CONFIG.port)
          htmlStr = htmlStr.replace('$$ERROR$$', err.message)
          res.set('Content-Type', 'text/html')
          res.status(404).send(htmlStr)
        })()
    }
  })
  return app
}

function getVersion () {
  const packageObj = JSON.parse(readJSON(path.join(__dirname, 'package.json')))
  return packageObj.version
}

function readJSON (filename) {
  /* 读文件 */
  var bin = fs.readFileSync(filename)
  if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
    bin = bin.slice(3)
  }
  return bin.toString('utf-8')
}
