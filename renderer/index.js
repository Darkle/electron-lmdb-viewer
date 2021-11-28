// @ts-nocheck
import * as Vue from 'vue'
import VueGoodTablePlugin from 'vue-good-table-next'
import debounce from 'lodash.debounce'

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

const state = Vue.reactive({
  dbCompression: false,
  dbEncoding: 'msgpack',
  showDataDialog: false,
  dbDataRenderStore: null,
  // dbDataIndexed: null,
  dbFilePath: '',
  searchTerm: '',
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
  totalRows: 0,
  rows: [],
  currentPage: 1,
})

// Cant show the whole data in the table cell as some data might be huge.
// We show it all in the textarea popup on ctrl+click instead.
function trimDBDataForTableCell({ key, value }) {
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
    return { state }
  },
  created() {
    const delay = 500
    this['onSearch'] = debounce(({ searchTerm }) => {
      state.searchTerm = searchTerm

      console.log(state.searchTerm)

      api
        .searchDb(searchTerm, state.currentPage)
        .then(({ totalResultCount, searchResultsPageChunk }) => {
          console.log('Page of db items:', searchResultsPageChunk)

          state.rows = searchResultsPageChunk.map(trimDBDataForTableCell)
          state.totalRows = totalResultCount

          this.scrollTableToTop()
        })
        .catch(err => {
          console.error(err)
          alert(err.toString())
        })
    }, delay)
  },
  mount() {
    Array.from(document.querySelectorAll('.hide')).forEach(elem => elem.classList.remove('hide'))
  },
  methods: {
    async openDB() {
      const dbData = await api.openNewDb(state.dbCompression, state.dbEncoding).catch(err => err)

      if (dbData.userCancelledFileSelect) {
        return
      }

      if (dbData instanceof Error) {
        alert(dbData.toString())
        return
      }

      if (!dbData.items) {
        alert('Did not find any data in db.')
        return
      }

      this.resetStateRowData()

      state.dbDataRenderStore = new Map()

      dbData.items.forEach(({ key, value }) => {
        state.dbDataRenderStore.set(key, value)
      })

      console.log(`DB total size: ${dbData.totalRows} items`)
      console.log('Initial page of db items:', dbData.items)

      state.dbFilePath = dbData.dbFilePath

      // state.dbDataIndexed = [...state.dbDataRenderStore.entries()]
      state.rows = dbData.items.map(trimDBDataForTableCell)
      state.totalRows = dbData.totalRows
    },
    onPageChange(params) {
      state.currentPage = params.currentPage

      const searchTerm = state.searchTerm.length > 0 ? state.searchTerm : null

      api
        .retrievePageOfDBItems(state.currentPage, searchTerm)
        .then(items => items.map(trimDBDataForTableCell))
        .then(pageOfDbData => {
          console.log('Page of db items:', pageOfDbData)

          state.rows = pageOfDbData

          this.scrollTableToTop()
        })
        .catch(err => {
          console.error(err)
          alert(err.toString())
        })
    },
    resetStateRowData() {
      state.rows = []
      state.totalRows = 0
      state.currentPage = 1
    },
    scrollTableToTop() {
      const tableContainer = document.querySelector('.vgt-responsive')
      tableContainer.scrollTop = 0
    },
    closeDialog() {
      state.showDataDialog = false
      this.$refs.textarea.value = ''
    },
  },
})

Vue.createApp(MainComponent).use(VueGoodTablePlugin).mount('#container')
