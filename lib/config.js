const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

/**
 * Config对象
 * @param {string} dirname 传入 __dirname
 * @param {string} nodeName 节点名 传入 Service-Datalist
 */
function Config (dirname, nodeName) {
  if (arguments.length === 0) {
    return Config.cnf
  }
  let dirList = dirname.split(path.sep)
  let configPath = dirname
  for (let i = 0; i < dirList.length - 1; i++) {
    if (fs.existsSync(path.join(configPath, 'config.yml'))) {
      let allConfig = yaml.safeLoad(fs.readFileSync(path.join(configPath, 'config.yml'), 'utf8'))
      if (nodeName) {
        Config.cnf = allConfig[nodeName]
      } else {
        Config.cnf = allConfig
      }
    } else {
      configPath = path.join(configPath, '../')
    }
  }
  return Config.cnf
}

/**
 * 配置对象
 */
Config.cnf = undefined

module.exports = Config
