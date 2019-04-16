const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

module.exports = configCtrl

/**
 * 获取配置文件
 * @param {string} dirname 传入 __dirname
 */
function configCtrl (dirname) {
  let dirList = dirname.split(path.sep)
  let configPath = dirname
  for (let i = 0; i < dirList.length - 1; i++) {
    if (fs.existsSync(path.join(configPath, 'config.yml'))) {
      return yaml.safeLoad(fs.readFileSync(path.join(configPath, 'config.yml'), 'utf8'))
    } else {
      configPath = path.join(configPath, '../')
    }
  }
  return null
}
