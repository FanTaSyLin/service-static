module.exports = mimeType

function mimeType (ext) {
  switch (ext) {
    case '.tif':
      return 'image/tiff'
    case '.png':
      return 'image/png'
    case '.jpg':
      return 'image/jpeg'
    case '.ico':
      return 'image/x-icon'
    case '.kml':
      return 'application/vnd.google-earth.kml+xml'
    default:
      return 'application/octet-stream'
  }
}
