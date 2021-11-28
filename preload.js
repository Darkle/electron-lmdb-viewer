// @ts-nocheck
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  openNewDb(compression, dbEncodingType) {
    return ipcRenderer.invoke('open-new-db', compression, dbEncodingType)
  },
  retrievePageOfDBItems(offset) {
    return ipcRenderer.invoke('retrieve-page-of-db-items', offset)
  },
})
