// @ts-nocheck
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  openNewDb(compression, dbEncodingType) {
    return ipcRenderer.invoke('open-new-db', compression, dbEncodingType)
  },
  retrievePageOfDBItems(page) {
    return ipcRenderer.invoke('retrieve-page-of-db-items', page)
  },
  searchDb(searchTerm, page) {
    return ipcRenderer.invoke('search-db', searchTerm, page)
  },
})
