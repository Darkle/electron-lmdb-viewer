// @ts-nocheck
const path = require('path')

const lmdb = require('lmdb')

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

const numItemsPerPage = 500

const isBinaryBuffer = val => val instanceof Uint8Array

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

const dbCache = {
  get totalRows() {
    return this.items.length
  },
  items: [],
  getPageOfDBItems(offset = 0) {
    const indexStart = offset === 0 ? offset : offset - 1
    const indexEnd = indexStart + numItemsPerPage
    return this.items.slice(indexStart, indexEnd).map(convertAnyBinaryDataToHexString)
  },
  search(searchTerm, offset) {
    const indexStart = offset === 0 ? offset : offset - 1
    const indexEnd = indexStart + numItemsPerPage
    // This could prolly be improved
    const searchResults = this.items.filter(({ key, value }) => {
      try {
        if (isBinaryBuffer(value)) {
          value = 'hex:' + value.toString('hex')
        } else if (isBinaryBuffer(key)) {
          key = 'hex:' + value.toString('hex')
        } else {
          value = value.toString()
          key = key.toString()
        }
        return key.includes(searchTerm) || value.includes(searchTerm)
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

// eslint-disable-next-line max-lines-per-function,complexity
ipcMain.handle('open-new-db', async (event, compression, dbEncodingType) => {
  try {
    const dbPath = await dialog
      .showOpenDialog({ properties: ['openFile', 'showHiddenFiles'] })
      .then(({ filePaths }) => filePaths[0])
      .catch(err => console.error(err))

    // User has cancelled file select dialog
    if (!dbPath) return { userCancelledFileSelect: true }

    if (db) db.close()

    db = lmdb.open(dbPath, { compression, encoding: dbEncodingType })

    dbCache.items = [...db.getRange()]

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
