const fs = require('fs')
const path = require('path')
const multipart = require('multiparty')
const Router = require('express').Router
const config = require('../lib/config')()

module.exports = function () {
  const router = new Router()
  router.route('/*').post(uploadFiles)
  return router
}

async function uploadFiles (req, res, next) {
  const url = req.params[0]
  const pathList = url.split('/')
  const root = config.root
  let dir = root
  for (let i = 0; i < pathList.length; i++) {
    dir = path.join(dir, pathList[i])
  }
  let existFlg = fs.existsSync(dir)
  if (existFlg === false) {
    return next(new Error(`No such directory ${dir}`))
  }
  try {
    const doc = await multipartyUpload(dir, req)
    res.status(200).json(doc)
  } catch (err) {
    return next(err)
  }
}

function multipartyUpload (dir, req) {
  return new Promise((resolve, reject) => {
    const form = new multipart.Form({
      uploadDir: dir
    })
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.file) {
        return reject(new Error(`Cannot read property [file] of undefined`))
      }
      let uploadedList = []
      for (let i = 0; i < files.file.length; i++) {
        const orgFilename = files.file[i].originalFilename
        fs.renameSync(files.file[i].path, path.join(dir, orgFilename))
        uploadedList.push(path.join(dir, orgFilename))
      }
      return resolve(uploadedList)
    })
  })
}
