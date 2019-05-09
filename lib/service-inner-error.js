function ServiceInnerError (error) {
  Error.call(this, typeof error === 'undefined' ? undefined : error.message)
  Error.captureStackTrace(this, this.constructor)
  this.name = 'ServiceInnerError'
  this.message = typeof error === 'undefined' ? undefined : error.message
  this.code = '500'
  this.status = 500
  this.inner = error
}

ServiceInnerError.prototype = Object.create(Error.prototype)
ServiceInnerError.prototype.constructor = ServiceInnerError

module.exports = ServiceInnerError
