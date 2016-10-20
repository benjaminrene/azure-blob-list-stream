'use strict'

const test = require('tape')
const azure = require('azure-storage')
const ListStream = require('./')

test(function (t) {
  t.plan(1)

  const blob = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING)

  const entries = []

  ListStream(blob, 'public')
    .on('data', entries.push.bind(entries))
    .on('end', () => t.ok(entries.length > 10 * 1000))
    .on('error', t.end)
})
