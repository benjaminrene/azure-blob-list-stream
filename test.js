'use strict'

const test = require('tape')
const azure = require('azure-storage')
const nock = require('nock')
const fs = require('fs')
const path = require('path')
const concat = require('concat-stream')
const ListStream = require('./')

const pages = [1, 2].map(n => fs.readFileSync(path.resolve(__dirname, `fixtures/page-${n}.xml`)))

nock.disableNetConnect()

const api = nock('https://hello.blob.core.windows.net')

test('normal', function (t) {
  t.plan(4)

  api
    .get('/public')
    .query({
      restype: 'container',
      comp: 'list'
    })
    .reply(200, pages[0], {
      'content-type': 'application/xml'
    })

  api
    .get('/public')
    .query({
      restype: 'container',
      comp: 'list',
      marker: '2!144!MDAwMDY0ITU2NjJmZjAyLWIwMzgtNDhlYy05ZWNhLTllZGZkNjE1NDU5ZV9SZWNvbW1lbmRhdGlvbi0xNDQ4NzA5MS5wZGYhMDAwMDI4ITk5OTktMTItMzFUMjM6NTk6NTkuOTk5OTk5OVoh'
    })
    .reply(200, pages[1], {
      'content-type': 'application/xml'
    })

  const blob = azure.createBlobService(`DefaultEndpointsProtocol=https;AccountName=hello;AccountKey=${Buffer.from('key').toString('base64')}`)

  ListStream(blob, 'public')
    .on('page', function (page) {
      t.equal(page.count, 1, 'emits pages')
    })
    .pipe(concat(function (blobs) {
      t.equal(blobs.length, 2, 'emits 2 blobs')
      t.equal(blobs[0].name, 'file.pdf', 'emits file.pdf')
    }))
})

test('initial token', function (t) {
  t.plan(2)

  api
    .get('/public')
    .query({
      restype: 'container',
      comp: 'list',
      marker: '2!144!MDAwMDY0ITU2NjJmZjAyLWIwMzgtNDhlYy05ZWNhLTllZGZkNjE1NDU5ZV9SZWNvbW1lbmRhdGlvbi0xNDQ4NzA5MS5wZGYhMDAwMDI4ITk5OTktMTItMzFUMjM6NTk6NTkuOTk5OTk5OVoh'
    })
    .reply(200, pages[1], {
      'content-type': 'application/xml'
    })

  const blob = azure.createBlobService(`DefaultEndpointsProtocol=https;AccountName=hello;AccountKey=${Buffer.from('key').toString('base64')}`)

  ListStream(blob, 'public', '2!144!MDAwMDY0ITU2NjJmZjAyLWIwMzgtNDhlYy05ZWNhLTllZGZkNjE1NDU5ZV9SZWNvbW1lbmRhdGlvbi0xNDQ4NzA5MS5wZGYhMDAwMDI4ITk5OTktMTItMzFUMjM6NTk6NTkuOTk5OTk5OVoh')
    .pipe(concat(function (blobs) {
      t.equal(blobs.length, 1, 'emits 1 blob')
      t.equal(blobs[0].name, 'file.pdf', 'emits file.pdf')
    }))
})
