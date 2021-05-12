const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const urlencode = require('urlencode')
const Router = require('express').Router
const mimeType = require('../lib/mime-type')
const moment = require('moment')
const CONFIG = require('../lib/config')()

module.exports = function () {
  const router = new Router()
  router.route('/*').get(getFile).delete(deleteFile)

  async function getFile (req, res, next) {
    const url = req.params[0]
    const attachment = req.query.attachment
    const pathList = url.split('/')
    let filename = CONFIG.root
    for (let i = 0; i < pathList.length; i++) {
      filename = path.join(filename, pathList[i])
    }
    const fstatus = fs.statSync(filename)
    if (fstatus.isDirectory()) {
      try {
        const files = fs.readdirSync(filename)
        if (req.query.json !== undefined) {
          res.status(200).json(files)
        } else {
          const htmlStr = await appendElement('../filelist.html', files, req.originalUrl)
          res.set('Content-Type', 'text/html')
          res.status(200).send(htmlStr)
        }
      } catch (error) {
        return next(error)
      }
    } else {
      fs.readFile(filename, (err, data) => {
        if (err) {
          return next(err)
        }
        const fileNameWithoutPath = path.extname(filename)
        const contentType = mimeType(fileNameWithoutPath)
        const baseFileName = urlencode(path.basename(filename))
        let contentDisposition
        if (attachment !== undefined) {
          if (attachment === '') {
            // 下载数据 使用原始文件名
            contentDisposition = `attachment;filename*=UTF-8''${baseFileName}`
          } else {
            // 下载数据 使用指定文件名
            contentDisposition = `attachment;filename*=UTF-8''${urlencode(attachment)}`
          }
        } else {
          contentDisposition = `filename*=UTF-8''${baseFileName}`
        }
        res.set({
          'Content-Type': contentType,
          'Content-Disposition': contentDisposition,
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

async function appendElement (file, filelist, url) {
  file = path.join(__dirname, file)
  url = _.trimEnd(url, '/')
  let htmlStr = fs.readFileSync(file, 'utf-8')
  const directory = url.replace('/service/static', '')
  const elementList = []
  if (url !== '/service/static' && url !== '/service/static/') {
    elementList.push(`<tr>
    <td valign="top"><img src="/public/back.png" alt="[PARENTDIR]"></td>
    <td><a href="${url}/..">Parent Directory</a></td>
    <td>&nbsp;</td>
    <td align="right">&nbsp;&nbsp;&nbsp;-</td>
    <td>&nbsp;</td>
    </tr>`)
  }
  for (let i = 0; i < filelist.length; i++) {
    if (filelist[i].indexOf('.') === 0) {
      continue
    }
    const item = filelist[i]
    const trElement = await createTrElement(directory, item)
    elementList.push(trElement)
  }
  htmlStr = htmlStr.replace('$$DIRECTORY$$', directory || '/')
  htmlStr = htmlStr.replace('$$VERSION$$', getVersion())
  return htmlStr.replace('$$FILELIST$$', elementList.join(''))
}

function createTrElement (directory, file) {
  return new Promise((resolve, reject) => {
    const pathLink = path.join(CONFIG.root, directory, file)
    fs.stat(pathLink, (err, stats) => {
      if (err) {
        return reject(err)
      } else {
        let trEle = ''
        if (stats.isDirectory()) {
          trEle = `<tr>
          <td valign="top"><img src="/public/directory.png" alt="[DIR]"></td>
          <td><a href="/service/static${directory}/${file}">${file}</a></td>
          <td align="right">&nbsp;&nbsp;&nbsp;${getDatetime(stats.mtimeMs)}</td>
          <td align="right">&nbsp;&nbsp;&nbsp;-</td>
          <td>&nbsp;</td>
          </tr>`
        } else {
          trEle = `<tr>
          <td valign="top"><img src="/public/file.png" alt="[FILE]"></td>
          <td><a href="/service/static${directory}/${file}">${file}</a></td>
          <td align="right">&nbsp;&nbsp;&nbsp;${getDatetime(stats.mtimeMs)}</td>
          <td align="right">&nbsp;&nbsp;&nbsp;${getFileSize(stats.size)}</td>
          <td>&nbsp;</td>
          </tr>`
        }
        return resolve(trEle)
      }
    })
  })
}

function getDatetime (time) {
  return moment(time).format('YYYY-MM-DD HH:mm:ss')
}

function getFileSize (size) {
  let x = size
  let i = 0
  const unit = ['B', 'KB', 'MB', 'GB', 'TB']
  while (x > 1024) {
    i++
    x = Math.round(size / Math.pow(1024, i), 1)
  }
  return `${x}${unit[i]}`
}

function getVersion () {
  const packageObj = JSON.parse(readJSON(path.join(__dirname, '..', 'package.json')))
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
