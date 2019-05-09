const fs = require('fs')
const path = require('path')
const Router = require('express').Router
const mimeType = require('../lib/mime-type')
const CONFIG = require('../lib/config')()

module.exports = function () {
  let router = new Router()
  router.route('/*').get(getFile).delete(deleteFile)

  function getFile (req, res, next) {
    let url = req.params[0]
    let pathList = url.split('/')
    let filename = CONFIG.root
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
        'Content-Disposition': 'filename=' + path.basename(filename),
        'Content-Length': data.length
      })
      res.status(200).send(data)
    })
  }

  function deleteFile (req, res, next) {
    let url = req.params[0]
    let pathList = url.split('/')
    let filename = CONFIG.root
    for (let i = 0; i < pathList.length; i++) {
      filename = path.join(filename, pathList[i])
    }
    let fsStatus = fs.statSync(filename)
    if (fsStatus.isDirectory()) {
      try {
        _delDir(filename)
        res.status(200).end()
      } catch (err) {
        next(err)
      }
    } else {
      try {
        fs.unlinkSync(filename)
        res.status(200).end()
      } catch (err) {
        next(err)
      }
    }
  }

  function _delDir (targetPath) {
    let files = []
    if (fs.existsSync(targetPath)) {
      files = fs.readdirSync(targetPath)
      files.forEach((file) => {
        let curPath = path.join(targetPath, file)
        if (fs.statSync(curPath).isDirectory()) {
          _delDir(curPath) // 递归删除文件夹
        } else {
          fs.unlinkSync(curPath) // 删除文件
        }
      })
      fs.rmdirSync(targetPath)
    }
  }

  return router
}
