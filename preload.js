// @ts-nocheck
const { contextBridge, ipcRenderer, clipboard } = require('electron')

contextBridge.exposeInMainWorld('api', {
  openNewDb(compression, dbEncodingType) {
    return ipcRenderer.invoke('open-new-db', compression, dbEncodingType)
  },
  copyToClipBoard(data) {
    clipboard.writeText(data)
  },
})
