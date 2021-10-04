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

    const dbItems = []

    db.getRange().forEach(item => dbItems.push(item))

    return { items: dbItems, dbFilePath: dbPath }
  } catch (err) {
    console.error(err)

    const errorMessage = err.toString()
    const additionalMessage = errorMessage.includes('Data read, but end of buffer not reached')
      ? '\nDid you remember to set the right DB settings?'
      : ''

    dialog.showErrorBox('Error Opening DB', err.toString() + additionalMessage)
  }
})
