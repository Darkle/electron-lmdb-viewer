// @ts-nocheck
const fs = require('fs')
const path = require('path')

const lmdb = require('lmdb')
const faker = require('faker')
const imgGen = require('js-image-generator')

console.log(
  '\nNote: We needed to re-install lmdb as we changed the node bindings previously with electron-rebuild, please wait...'
)
console.log('\nCreating databases, please wait...\n')

const testDBsFolderPath = path.join(process.cwd(), 'test-dbs')

if (!fs.statSync(testDBsFolderPath, { throwIfNoEntry: false })) fs.mkdirSync(testDBsFolderPath)

let msgpack_no_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'msgpack_no_compression.lmdb'),
  compression: false,
  encoding: 'msgpack',
})

let msgpack_with_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'msgpack_with_compression.lmdb'),
  compression: true,
  encoding: 'msgpack',
})

let json_no_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'json_no_compression.lmdb'),
  compression: false,
  encoding: 'json',
})

let json_with_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'json_with_compression.lmdb'),
  compression: true,
  encoding: 'json',
})

let cbor_no_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'cbor_no_compression.lmdb'),
  compression: false,
  encoding: 'cbor',
})

let cbor_with_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'cbor_with_compression.lmdb'),
  compression: true,
  encoding: 'cbor',
})

let string_no_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'string_no_compression.lmdb'),
  compression: false,
  encoding: 'string',
})

let string_with_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'string_with_compression.lmdb'),
  compression: true,
  encoding: 'string',
})

let binary_no_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'binary_no_compression.lmdb'),
  compression: false,
  encoding: 'binary',
})

let binary_with_compression = lmdb.open({
  path: path.join(testDBsFolderPath, 'binary_with_compression.lmdb'),
  compression: true,
  encoding: 'binary',
})

const arrayLength = 5000

Promise.all([
  msgpack_no_compression
    .transactionAsync(() => {
      Array.from({ length: arrayLength }, () => {
        msgpack_no_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => msgpack_no_compression.close()),

  msgpack_with_compression
    .transactionAsync(() => {
      Array.from({ length: arrayLength }, () => {
        msgpack_with_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => msgpack_with_compression.close()),

  json_no_compression
    .transactionAsync(() => {
      Array.from({ length: arrayLength }, () => {
        json_no_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => json_no_compression.close()),

  json_with_compression
    .transactionAsync(() => {
      Array.from({ length: arrayLength }, () => {
        json_with_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => json_with_compression.close()),

  cbor_no_compression
    .transactionAsync(() => {
      Array.from({ length: arrayLength }, () => {
        cbor_no_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => cbor_no_compression.close()),

  cbor_with_compression
    .transactionAsync(() => {
      Array.from({ length: arrayLength }, () => {
        cbor_with_compression.put(faker.name.findName(), faker.datatype.json())
      })
    })
    .then(() => cbor_with_compression.close()),

  string_no_compression
    .transactionAsync(() => {
      Array.from({ length: arrayLength }, () => {
        string_no_compression.put(faker.name.findName(), faker.address.streetAddress())
      })
    })
    .then(() => string_no_compression.close()),

  string_with_compression
    .transactionAsync(() => {
      Array.from({ length: arrayLength }, () => {
        string_with_compression.put(faker.name.findName(), faker.address.streetAddress())
      })
    })
    .then(() => string_with_compression.close()),

  binary_no_compression
    .transactionAsync(() => {
      Array.from({ length: 50 }, () => {
        imgGen.generateImage(800, 600, 80, function (err, image) {
          binary_no_compression.put(faker.name.findName(), image.data)
        })
      })
    })
    .then(() => binary_no_compression.close()),

  binary_with_compression
    .transactionAsync(() => {
      Array.from({ length: 50 }, () => {
        imgGen.generateImage(800, 600, 80, function (err, image) {
          binary_with_compression.put(faker.name.findName(), image.data)
        })
      })
    })
    .then(() => binary_with_compression.close()),
])
  .then(() => {
    console.log('Finished creating temp databases.')
    console.log('\nWe now need to re-run electron-rebuild.\n')
  })
  .catch(err => console.error(err))
