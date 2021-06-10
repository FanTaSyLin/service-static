const fs = require('fs')
const path = require('path')
const Router = require('express').Router
const config = require('../lib/config')()

module.exports = function () {
	const router = new Router()
	router.route('/*').get(getVideoStream)
	return router
}

function getVideoStream (req, res, next) {
	// /Volumes/External/DATA/2d3d.mp4
	const filename = path.join(config.root, req.params[0])
	fs.stat(filename, (error, stats) => {
		if (error) {
			if (error.code === 'ENOENT') {
				return res.status(404).end()
			}
			return next(error)
		}
		const range = req.headers.range
		if (!range) {
			return res.status(416).end()
		}
		const positions = range.replace(/bytes=/, "").split("-")
		const start = parseInt(positions[0], 10)
		const total = stats.size
		const end = positions[1] ? parseInt(positions[1], 10) : total - 1
		const chunksize = (end - start) + 1
		res.set({
			"Content-Range": "bytes " + start + "-" + end + "/" + total,
			"Accept-Ranges": "bytes",
			"Content-Length": chunksize,
			"Content-Type": "video/mp4"
		})
		res.status(206)
		fs.createReadStream(filename, { start: start, end: end }).pipe(res)
	})
}