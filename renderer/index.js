// @ts-nocheck
import * as Vue from 'vue'
import VueGoodTablePlugin from 'vue-good-table-next'

const isBinaryBuffer = val => val instanceof Uint8Array

let userIsPressingCtrlKey = false

document.addEventListener('keydown', event => {
  if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
    userIsPressingCtrlKey = true
  }
})

document.addEventListener('keyup', event => {
  if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
    userIsPressingCtrlKey = false
  }
})

// const tdMouseEvents = cell => ({
//   onclick: event => {
//     if (!userIsPressingCtrlKey) return

//     $('#show-data-dialog>textarea').value = ''

//     const type = event.target.dataset.columnId
//     const row = Number(event.target.parentNode.firstElementChild.textContent.trim()) - 1

//     let thingToShow = event.target.dataset.columnId === 'value' ? indexedDBData[row][1] : indexedDBData[row][0]

//     if (thingToShow instanceof Uint8Array) {
//       thingToShow = thingToShow.toString('hex')
//     }

//     $('#show-data-dialog').classList.remove('hide')
//     $('#show-data-dialog>textarea').value = thingToShow
//   },
//   onmouseenter: event => {
//     if (!userIsPressingCtrlKey) return
//     event.target.style.cursor = 'pointer'
//   },
//   onmouseleave: event => {
//     event.target.style.cursor = 'auto'
//   },
//   onmousemove: event => {
//     if (userIsPressingCtrlKey) {
//       event.target.style.cursor = 'pointer'
//     } else {
//       event.target.style.cursor = 'auto'
//     }
//   },
// })

// eslint-disable-next-line complexity
function processDBData({ key, value }) {
  if (isBinaryBuffer(value)) {
    value = 'hex:' + value.toString('hex')
  }
  if (isBinaryBuffer(key)) {
    key = 'hex:' + value.toString('hex')
  }
  // Cant show the whole data in the table as some data might be huge.
  // We show it all in the textarea popup on ctrl+click instead.
  if (value.length > 100) {
    value = value.slice(0, 100) + '...'
  }
  if (key.length > 100) {
    key = key.slice(0, 100) + '...'
  }

  return { key, value }
}

const MainComponent = Vue.defineComponent({
  data() {
    return {
      dbCompression: false,
      dbEncoding: 'msgpack',
      loadingDB: false,
      showDataDialog: false,
      dbDataRenderStore: null,
      // dbDataIndexed: null,
      dbFilePath: '',
      columns: [
        {
          label: 'Key',
          field: 'key',
        },
        {
          label: 'Value',
          field: 'value',
        },
      ],
      totalRecords: 0,
      rows: [],
    }
  },
  mount() {
    Array.from(document.querySelectorAll('.hide')).forEach(elem => elem.classList.remove('hide'))
  },
  methods: {
    openDB() {
      this.loadingDB = true

      api.openNewDb(this.dbCompression, this.dbEncoding).then(dbData => {
        this.loadingDB = false

        if (!dbData || dbData instanceof Error) {
          return
        }

        this.dbDataRenderStore = new Map()

        dbData.items.forEach(({ key, value }) => {
          this.dbDataRenderStore.set(key, value)
        })

        // this.dbDataIndexed = [...this.dbDataRenderStore.entries()]
        this.dbFilePath = dbData.dbFilePath
        this.totalRecords = dbData.dbLength
        this.rows = dbData.items.map(processDBData)
        console.log(JSON.parse(JSON.stringify(this.rows)))
      })
    },
    closeDialog() {
      this.showDataDialog = false
      this.$refs.textarea.value = ''
    },
  },
})

Vue.createApp(MainComponent).use(VueGoodTablePlugin).mount('#container')
