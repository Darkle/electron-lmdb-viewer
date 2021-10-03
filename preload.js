// @ts-nocheck
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  openNewDb(compression, dbEncodingType) {
    return ipcRenderer.invoke('open-new-db', compression, dbEncodingType)
  },
})

// process.once('loaded', () => {
//   ipcRenderer.on('db-opened', (event, dbData) => {
//     window.grid
//       .updateConfig({ columns: ['Key', 'Value'], data: dbData.items.map(({ key, value }) => [key, value]) })
//       .forceRender()
//   })
// })
