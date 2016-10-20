'use strict'

const assert = require('assert')
const Readable = require('stream').Readable

module.exports = ListStream

function ListStream (blob, container) {
  if (!(this instanceof ListStream)) {
    return new ListStream(blob, container)
  }

  assert(blob, 'azure blob service is required')
  assert(container, 'azure blob container is required')

  this.blob = blob
  this.container = container

  this.queue = []

  Readable.call(this, {objectMode: true})
}

ListStream.prototype = Object.create(Readable.prototype)

ListStream.prototype._read = function _read () {
  if (this.queue.length) {
    return this.push(this.queue.shift())
  }

  if (this.token === null) {
    return this.push(null)
  }

  this.blob.listBlobsSegmented(this.container, this.token, (err, result) => {
    if (err) return this.emit('error', err)
    this.token = result.continuationToken
    this.queue = result.entries

    this._read()
  })
}
