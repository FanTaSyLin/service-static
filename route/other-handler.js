const fs = require('fs')
const path = require('path')
const Router = require('express').Router

module.exports = function () {
  const router = new Router()
  router.route('/version').get(getVersion)
  return router
}

function getVersion (req, res, next) {
  const packageObj = JSON.parse(readJSON(path.join(__dirname, '..', 'package.json')))
  res.status(200).json(packageObj.version)
}

function readJSON (filename) {
  /* 读文件 */
  var bin = fs.readFileSync(filename)
  if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
    bin = bin.slice(3)
  }
  return bin.toString('utf-8')
}
