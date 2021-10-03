import fs from 'fs'
import path from 'path'

import { open as openLMDB } from 'lmdb'
import faker from 'faker'
// @ts-expect-error
import imgGen from 'js-image-generator'

console.log('Creating databases, please wait...')

const testDBsFolderPath = path.join(process.cwd(), 'test-dbs')

if (!fs.statSync(testDBsFolderPath, { throwIfNoEntry: false })) fs.mkdirSync(testDBsFolderPath)

let msgpack_no_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'msgpack_no_compression.lmdb'),
  compression: false,
  encoding: 'msgpack',
})

let msgpack_with_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'msgpack_with_compression.lmdb'),
  compression: true,
  encoding: 'msgpack',
})

let json_no_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'json_no_compression.lmdb'),
  compression: false,
  encoding: 'json',
})

let json_with_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'json_with_compression.lmdb'),
  compression: true,
  encoding: 'json',
})

let cbor_no_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'cbor_no_compression.lmdb'),
  compression: false,
  // @ts-expect-error
  encoding: 'cbor',
})

let cbor_with_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'cbor_with_compression.lmdb'),
  compression: true,
  // @ts-expect-error
  encoding: 'cbor',
})

let string_no_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'string_no_compression.lmdb'),
  compression: false,
  encoding: 'string',
})

let string_with_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'string_with_compression.lmdb'),
  compression: true,
  encoding: 'string',
})

let binary_no_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'binary_no_compression.lmdb'),
  compression: false,
  encoding: 'binary',
})

let binary_with_compression = openLMDB({
  path: path.join(testDBsFolderPath, 'binary_with_compression.lmdb'),
  compression: true,
  encoding: 'binary',
})

Promise.all([
  msgpack_no_compression
    .transactionAsync(() => {
      Array.from({ length: 1000 }, () => {
        msgpack_no_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => msgpack_no_compression.close()),

  msgpack_with_compression
    .transactionAsync(() => {
      Array.from({ length: 1000 }, () => {
        msgpack_with_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => msgpack_with_compression.close()),

  json_no_compression
    .transactionAsync(() => {
      Array.from({ length: 1000 }, () => {
        json_no_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => json_no_compression.close()),

  json_with_compression
    .transactionAsync(() => {
      Array.from({ length: 1000 }, () => {
        json_with_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => json_with_compression.close()),

  cbor_no_compression
    .transactionAsync(() => {
      Array.from({ length: 1000 }, () => {
        cbor_no_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => cbor_no_compression.close()),

  cbor_with_compression
    .transactionAsync(() => {
      Array.from({ length: 1000 }, () => {
        cbor_with_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => cbor_with_compression.close()),

  string_no_compression
    .transactionAsync(() => {
      Array.from({ length: 1000 }, () => {
        string_no_compression.put(faker.name.findName(), faker.address.streetAddress())
      })
    })
    .then(() => string_no_compression.close()),

  string_with_compression
    .transactionAsync(() => {
      Array.from({ length: 1000 }, () => {
        string_with_compression.put(faker.name.findName(), faker.address.streetAddress())
      })
    })
    .then(() => string_with_compression.close()),

  binary_no_compression
    .transactionAsync(() => {
      Array.from({ length: 50 }, () => {
        // @ts-expect-error
        imgGen.generateImage(800, 600, 80, function (err, image) {
          binary_no_compression.put(faker.name.findName(), image.data)
        })
      })
    })
    .then(() => binary_no_compression.close()),

  binary_with_compression
    .transactionAsync(() => {
      Array.from({ length: 50 }, () => {
        // @ts-expect-error
        imgGen.generateImage(800, 600, 80, function (err, image) {
          binary_with_compression.put(faker.name.findName(), image.data)
        })
      })
    })
    .then(() => binary_with_compression.close()),
])
  .then(() => console.log('Finished creating temp databases.'))
  .catch(err => console.error(err))
