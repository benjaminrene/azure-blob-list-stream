# azure-blob-list-stream [![Build Status](https://travis-ci.org/bendrucker/azure-blob-list-stream.svg?branch=master)](https://travis-ci.org/bendrucker/azure-blob-list-stream)

> Stream a list of all files from an Azure Blob Storage collection


## Install

```
$ npm install --save azure-blob-list-stream
```


## Usage

```js
var ListStream = require('azure-blob-list-stream')
var blob = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING)

ListStream(blob, 'my-container')
  .on('data', (blob) => console.log(blob.name))
```

## API

#### `ListStream(blob, container)` -> `Readable`

Returns a readable stream that emits each Blob Storage file entry.

##### blob

*Required*  
Type: `object`

An Azure Blob Storage interface that you construct.

##### container

*Required*  
Type: `string`

The name of the storage container to list.


## License

MIT © [Ben Drucker](http://bendrucker.me)
