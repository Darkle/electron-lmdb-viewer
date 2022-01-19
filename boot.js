// @ts-nocheck
const path = require('path')

const lmdb = require('lmdb')
const msgpackr = require('msgpackr')
const cborX = require('cbor-x')

const { app, BrowserWindow, ipcMain, dialog } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      preload: path.join(process.cwd(), 'preload.js'),
    },
    icon: path.join(process.cwd(), 'app-icon.png'),
  })

  win.loadFile(path.join(process.cwd(), 'renderer', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

let db = null

const numItemsPerPage = 300

let dbEncodingType = 'msgpack'

const isBinaryBuffer = val => val instanceof Uint8Array
const isNotBinaryBuffer = val => !isBinaryBuffer(val)
const isString = val => typeof val === 'string'
const isNotString = val => !isString(val)

// Its way faster to do this on the backend as opposed to in the renderer.
function convertAnyBinaryDataToHexString({ key, value }) {
  if (isBinaryBuffer(value)) {
    value = 'hex:' + value.toString('hex')
  }
  if (isBinaryBuffer(key)) {
    key = 'hex:' + value.toString('hex')
  }
  return { key, value }
}

function stringify(val) {
  // if (isBinaryBuffer(key)) {
  // If they wanted to search binary, would they want to search by hex or would we assume its text in binary form and use TextDecoder? I guess could add a checkbox or summin to the search.
  //   key = new TextDecoder('utf-8').decode(key)
  // }
  // if (isBinaryBuffer(value)) {
  //   value = new TextDecoder('utf-8').decode(value)
  // }
  try {
    return JSON.stringify(val)
  } catch (error) {
    return val.toString()
  }
}

function convertDBDataToOriginalForm(dbDataRow) {
  if (dbEncodingType === 'msgpack') {
    return { key: dbDataRow.key, value: stringify(dbDataRow.value) }
  }
  if (dbEncodingType === 'cbor') {
    return { key: dbDataRow.key, value: stringify(dbDataRow.value) }
  }
  if (dbEncodingType === 'json') {
    return { key: dbDataRow.key, value: stringify(dbDataRow.value) }
  }
  return
}

const dbCache = {
  get totalRows() {
    return this.items.length
  },
  items: [],
  getPageOfDBItems(offset = 0) {
    const indexStart = offset === 0 ? offset : offset - 1
    const indexEnd = indexStart + numItemsPerPage
    return this.items.slice(indexStart, indexEnd)
  },
  search(searchTerm, offset) {
    searchTerm = searchTerm.toLowerCase()
    const indexStart = offset === 0 ? offset : offset - 1
    const indexEnd = indexStart + numItemsPerPage
    // This could prolly be improved
    const searchResults = this.items.filter(({ key, value }) => {
      try {
        // Ignoring binary for now.
        if (isString(key) && key.toLowerCase().includes(searchTerm)) {
          return true
        }
        if (isString(value) && value.toLowerCase().includes(searchTerm)) {
          return true
        }

        return false
      } catch (err) {
        console.error(err)
        return false
      }
    })

    const searchResultsPageChunk = searchResults.slice(indexStart, indexEnd)

    return { totalResultCount: searchResults.length, searchResultsPageChunk }
  },
}

ipcMain.handle('retrieve-page-of-db-items', (event, page) => {
  const offset = (page - 1) * numItemsPerPage
  return dbCache.getPageOfDBItems(offset)
})

ipcMain.handle('search-db', (event, searchTerm, page) => {
  const offset = (page - 1) * numItemsPerPage
  return dbCache.search(searchTerm, offset)
})

ipcMain.handle('open-new-db', async (event, compression, dbEncType) => {
  dbEncodingType = dbEncType
  try {
    const dbPath = await dialog
      .showOpenDialog({ properties: ['openFile', 'showHiddenFiles'] })
      .then(({ filePaths }) => filePaths[0])
      .catch(err => console.error(err))

    // User has cancelled file select dialog
    if (!dbPath) return { userCancelledFileSelect: true }

    if (db) db.close()

    db = lmdb.open(dbPath, { compression, encoding: dbEncodingType })

    dbCache.items = [...db.getRange()].map(convertDBDataToOriginalForm)

    const dbFirstPageOfDBItems = dbCache.getPageOfDBItems()

    return { items: dbFirstPageOfDBItems, dbFilePath: dbPath, totalRows: dbCache.totalRows }
  } catch (err) {
    console.error(err)

    const errorMessage = err.toString()
    const additionalMessage = errorMessage.includes('Data read, but end of buffer not reached')
      ? '\nDid you remember to set the right DB settings?'
      : ''

    dialog.showErrorBox('Error Opening DB', err.toString() + additionalMessage)
  }
})
