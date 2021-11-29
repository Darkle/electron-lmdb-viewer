// @ts-nocheck
import * as Vue from 'vue'
import VueGoodTablePlugin from 'vue-good-table-next'
import debounce from 'lodash.debounce'

let nonProxifiedRows = []

const state = Vue.reactive({
  dbCompression: false,
  dbEncoding: 'msgpack',
  showDataDialog: false,
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

function tryPrettifyJSON(val) {
  try {
    return JSON.stringify(JSON.parse(val), null, ' ')
  } catch (error) {
    return val
  }
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

          nonProxifiedRows = searchResultsPageChunk
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
  mounted() {
    // Hidden, then removed first to prevent a flash of the element on load
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

      console.log(`DB total size: ${dbData.totalRows} items`)
      console.log('Initial page of db items:', dbData.items)

      state.dbFilePath = dbData.dbFilePath

      nonProxifiedRows = dbData.items
      state.rows = dbData.items.map(trimDBDataForTableCell)

      state.totalRows = dbData.totalRows
    },
    onPageChange(params) {
      state.currentPage = params.currentPage

      const searchTerm = state.searchTerm.length > 0 ? state.searchTerm : null

      api
        .retrievePageOfDBItems(state.currentPage, searchTerm)
        .then(pageOfDbData => {
          console.log('Page of db items:', pageOfDbData)

          nonProxifiedRows = pageOfDbData
          state.rows = pageOfDbData.map(trimDBDataForTableCell)

          this.scrollTableToTop()
        })
        .catch(err => {
          console.error(err)
          alert(err.toString())
        })
    },
    onCellClick(params) {
      state.showDataDialog = true
      const cellData = nonProxifiedRows[params.rowIndex][params.column.field]

      console.log(cellData)

      document.querySelector('textarea').value = tryPrettifyJSON(cellData)
    },
    resetStateRowData() {
      nonProxifiedRows = []
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
      document.querySelector('textarea').value = ''
    },
  },
})

Vue.createApp(MainComponent).use(VueGoodTablePlugin).mount('#container')
