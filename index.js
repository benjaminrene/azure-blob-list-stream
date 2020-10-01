'use strict'

const assert = require('assert')
const Readable = require('stream').Readable

module.exports = ListStream

function ListStream (blob, container, prefix, token) {
  if (!(this instanceof ListStream)) {
    return new ListStream(blob, container, token)
  }

  assert(blob, 'azure blob service is required')
  assert(container, 'azure blob container is required')

  this.blob = blob
  this.container = container
  this.prefix = prefix

  if (token) {
    this.token = {
      nextMarker: token,
      targetLocation: 0
    }
  }

  this.queue = []

  Readable.call(this, { objectMode: true })
}

ListStream.prototype = Object.create(Readable.prototype)

ListStream.prototype._read = function _read () {
  if (this.loading) return

  if (this.empty()) {
    if (this.token === null) return this.push(null)

    return this.page((err, page) => {
      if (err) return this.emit('error', err)
      this.emit('page', page)
      this.push(this.shift())
    })
  }

  this.push(this.shift())
}

ListStream.prototype.page = function page (callback) {
  this.loading = true

  this.blob.listBlobsSegmentedWithPrefix(this.container, this.prefix, this.token, (err, result) => {
    if (err) return callback(err)

    this.queue = result.entries
    this.token = result.continuationToken
    this.loading = false

    callback(null, {
      token: this.token,
      count: result.entries.length
    })
  })
}

ListStream.prototype.shift = function shfit () {
  return this.queue.shift()
}

ListStream.prototype.empty = function empty () {
  return !this.queue.length
}
