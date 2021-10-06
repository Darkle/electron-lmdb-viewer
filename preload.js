// @ts-nocheck
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  openNewDb(compression, dbEncodingType) {
    return ipcRenderer.invoke('open-new-db', compression, dbEncodingType)
  },
  // getKeyValue(key) {
  //   return ipcRenderer.invoke('get-key-value', key)
  // },
})
