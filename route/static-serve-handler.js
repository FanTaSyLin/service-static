const fs = require('fs')
const path = require('path')
const Router = require('express').Router
const mimeType = require('../lib/mime-type')

module.exports = function (root) {
  let router = new Router()
  if (!root || root === '') {
    root = __dirname
  }
  router.route('/*').get(getFile)

  function getFile (req, res, next) {
    let url = req.params[0]
    let pathList = url.split('/')
    let filename = root
    for (let i = 0; i < pathList.length; i++) {
      filename = path.join(filename, pathList[i])
    }
    fs.readFile(filename, (err, data) => {
      if (err) {
        return next(err)
      }
      let contentType = mimeType(path.extname(filename))
      res.set({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With',
        'Content-Disposition': 'filename=' + filename,
        'Content-Length': data.length
      })
      res.status(200).send(data)
    })
  }

  return router
}
