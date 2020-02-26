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
    case '.zip':
      return 'application/zip'
    case '.xls':
    case '.xla':
    case '.xlc':
    case '.xlm':
    case '.xlt':
    case '.xlw':
      return 'application/vnd.ms-excel'
    default:
      return 'application/octet-stream'
  }
}
