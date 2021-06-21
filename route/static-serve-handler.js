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
    let fstatus
    for (let i = 0; i < pathList.length; i++) {
      filename = path.join(filename, pathList[i])
    }
    try {
      fstatus = fs.lstatSync(filename)
    } catch (error) {
      return next(error)
    }
    const fileRole = getAccessRole(filename)
    if (fstatus.isDirectory() || fstatus.isSymbolicLink()) {
      try {
        if (fileRole[0] === '-') {
          throw new Error(`cannot open directory '${filename}': Permission denied`)
        } else {
          const files = fs.readdirSync(filename)
          if (req.query.json !== undefined) {
            res.status(200).json(files)
          } else {
            let fileObjList = _.map(files, o => {
              const fstat = fs.statSync(path.join(filename, o))
              return {
                fstat: fstat,
                mtimeMs: fstat.mtimeMs,
                file: o
              }
            })
            fileObjList = _.orderBy(fileObjList, ['mtimeMs'], ['desc'])
            let htmlStr = appendElement('../filelist.html', fileObjList, req.originalUrl)
            htmlStr = htmlStr.replace('$$HOST$$', req.host)
            res.set('Content-Type', 'text/html')
            res.status(200).send(htmlStr)
          }
        }
      } catch (error) {
        return next(error)
      }
    } else {
      if (fileRole[0] === '-') {
        return next(new Error(`cannot open '${filename}': Permission denied`))
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
  }

  function deleteFile (req, res, next) {
    const url = req.params[0]
    const pathList = url.split('/')
    let filename = CONFIG.root
    for (let i = 0; i < pathList.length; i++) {
      filename = path.join(filename, pathList[i])
    }
    const fsStatus = fs.statSync(filename)
    const fileRole = getAccessRole(filename)
    if (fileRole[2] === '-') {
      return next(new Error(`cannot delete '${filename}': Permission denied`))
    } else {
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

function appendElement (file, fstatList, url) {
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
  for (let i = 0; i < fstatList.length; i++) {
    if (fstatList[i].file.indexOf('.') === 0) {
      continue
    }
    const item = fstatList[i]
    const trElement = createTrElement(directory, item)
    elementList.push(trElement)
  }
  htmlStr = htmlStr.replace('$$DIRECTORY$$', directory || '/')
  htmlStr = htmlStr.replace('$$VERSION$$', getVersion())
  htmlStr = htmlStr.replace('$$PORT$$', CONFIG.port)
  return htmlStr.replace('$$FILELIST$$', elementList.join(''))
}

function createTrElement (directory, fileObj) {
  const file = path.basename(fileObj.file)
  const fstat = fileObj.fstat
  let trEle = ''
  if (fstat.isDirectory()) {
    trEle = `<tr>
          <td valign="top"><img src="/public/directory.png" alt="[DIR]"></td>
          <td><a href="/service/static${directory}/${file}">${file}</a></td>
          <td align="right">&nbsp;&nbsp;&nbsp;${getDatetime(fstat.mtimeMs)}</td>
          <td align="right">&nbsp;&nbsp;&nbsp;-</td>
          <td>&nbsp;</td>
          </tr>`
  } else if (fstat.isSymbolicLink()) {
    trEle = `<tr>
          <td valign="top"><img src="/public/link.png" alt="[FILE]"></td>
          <td><a href="/service/static${directory}/${file}">${file}</a></td>
          <td align="right">&nbsp;&nbsp;&nbsp;${getDatetime(fstat.mtimeMs)}</td>
          <td align="right">&nbsp;&nbsp;&nbsp;${getFileSize(fstat.size)}</td>
          <td>&nbsp;</td>
          </tr>`
  } else {
    trEle = `<tr>
          <td valign="top"><img src="/public/file.png" alt="[FILE]"></td>
          <td><a href="/service/static${directory}/${file}">${file}</a></td>
          <td align="right">&nbsp;&nbsp;&nbsp;${getDatetime(fstat.mtimeMs)}</td>
          <td align="right">&nbsp;&nbsp;&nbsp;${getFileSize(fstat.size)}</td>
          <td>&nbsp;</td>
          </tr>`
  }
  return trEle
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

function getAccessRole (filename) {
  if (CONFIG.allowlist && _.isArray(CONFIG.allowlist) && CONFIG.allowlist.length > 0) {
    return getAccessRoleByAllowList(filename)
  } else if (CONFIG.blocklist && _.isArray(CONFIG.blocklist) && CONFIG.blocklist.length > 0) {
    return getAccessRoleByBlockList(filename)
  } else {
    return ['r', 'w', 'x']
  }
}

function getAccessRoleByAllowList (filename) {
  const allowList = CONFIG.allowlist
  let targetRole = ['-', '-', '-']
  if (filename === CONFIG.root) {
    return ['r', 'w', 'x']
  }
  filename = filename.replace(CONFIG.root, '')
  allowList.forEach(element => {
    try {
      const pathStr = _.trimEnd(_.dropRight(element.split(' ')).join(' '), ' ')
      const roles = _.last(element.split(' '))
      if (pathStr.indexOf('/') === 0) {
        const isMatch = new RegExp(`^${pathStr}`).test(filename)
        if (isMatch) {
          targetRole = [roles[0], roles[1], roles[2]]
        }
      } else {
        const isMatch = new RegExp(`${pathStr}`).test(filename)
        if (isMatch) {
          targetRole = [roles[0], roles[1], roles[2]]
        }
      }
    } catch (error) {
      console.error(error)
    }
  })
  return targetRole
}

function getAccessRoleByBlockList (filename) {
  const blockList = CONFIG.blocklist
  let targetRole = ['r', 'w', 'x']
  if (filename === CONFIG.root) {
    return ['r', 'w', 'x']
  }
  filename = filename.replace(CONFIG.root, '')
  blockList.forEach(element => {
    try {
      const pathStr = _.trimEnd(_.dropRight(element.split(' ')).join(' '), ' ')
      const roles = _.last(element.split(' '))
      if (pathStr.indexOf('/') === 0) {
        const isMatch = new RegExp(`^${pathStr}`).test(filename)
        if (isMatch) {
          targetRole = [roles[0], roles[1], roles[2]]
        }
      } else {
        const isMatch = new RegExp(`${pathStr}`).test(filename)
        if (isMatch) {
          targetRole = [roles[0], roles[1], roles[2]]
        }
      }
    } catch (error) {
      console.error(error)
    }
  })
  return targetRole
}
