const mime = require('mime')

module.exports = mimeType

function mimeType (ext) {
  return mime.getType(ext)
}
