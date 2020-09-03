const fs = require('fs')
const path = require('path')
const Router = require('express').Router
const mimeType = require('../lib/mime-type')
const CONFIG = require('../lib/config')()

module.exports = function () {
  const router = new Router()
  router.route('/*').get(getFile).delete(deleteFile)

  function getFile (req, res, next) {
    const url = req.params[0]
    const pathList = url.split('/')
    let filename = CONFIG.root
    for (let i = 0; i < pathList.length; i++) {
      filename = path.join(filename, pathList[i])
    }
    const fstatus = fs.statSync(filename)
    if (fstatus.isDirectory()) {
      fs.readdir(filename, (err, files) => {
        if (err) {
          return next(err)
        }
        res.status(200).json(files)
      })
    } else {
      fs.readFile(filename, (err, data) => {
        if (err) {
          return next(err)
        }
        const fileNameWithoutPath = path.extname(filename)     
        const contentType = mimeType(fileNameWithoutPath)
        res.set({
          'Content-Type': contentType,
          'Content-Disposition': 'filename=' + fileNameWithoutPath,
          'Content-Length': data.length
        })
        res.status(200).send(data)
      })
    }
  }

  function deleteFile (req, res, next) {
    const url = req.params[0]
    const pathList = url.split('/')
    let filename = CONFIG.root
    for (let i = 0; i < pathList.length; i++) {
      filename = path.join(filename, pathList[i])
    }
    const fsStatus = fs.statSync(filename)
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
        const curPath = path.join(targetPath, file)
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
