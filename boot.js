// @ts-nocheck
const path = require('path')

const lmdb = require('lmdb')

const { app, BrowserWindow, ipcMain, dialog } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(process.cwd(), 'preload.js'),
    },
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

ipcMain.handle('open-new-db', async (event, compression, dbEncodingType) => {
  try {
    const dbPath = await dialog
      .showOpenDialog({ properties: ['openFile', 'showHiddenFiles'] })
      .then(({ filePaths }) => filePaths[0])
      .catch(err => console.error(err))

    // User has cancelled file select dialog
    if (!dbPath) return

    if (db) db.close()

    db = lmdb.open(dbPath, { compression, encoding: dbEncodingType })

    let totalItemsInDB = []
    let rangeOfItemsInDB = []

    await db.transactionAsync(() => {
      db.getKeys().forEach(item => totalItemsInDB.push(item))
      db.getRange({ limit: 500 }).forEach(item => rangeOfItemsInDB.push(item))
    })

    return { totalNumItemsInDB: totalItemsInDB.length, items: rangeOfItemsInDB, dbFilePath: dbPath }
  } catch (err) {
    console.error(err)
    dialog.showErrorBox('Error Opening DB', err.toString())
  }
})
