// @ts-nocheck

const $$ = q => Array.from(document.querySelectorAll(q))
const $ = document.querySelector.bind(document)

let grid = null
let dbDataRenderStore = null
let indexedDBData = null

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

$('#dialog-close').addEventListener('click', () => {
  $('#show-data-dialog>textarea').value = ''
  $('#show-data-dialog').classList.add('hide')
})

// eslint-disable-next-line max-lines-per-function
const tdMouseEvents = cell => ({
  onclick: event => {
    if (!userIsPressingCtrlKey) return

    $('#show-data-dialog>textarea').value = ''

    const type = event.target.dataset.columnId
    const row = Number(event.target.parentNode.firstElementChild.textContent.trim()) - 1

    let thingToShow = event.target.dataset.columnId === 'value' ? indexedDBData[row][1] : indexedDBData[row][0]

    if (thingToShow instanceof Uint8Array) {
      thingToShow = thingToShow.toString('hex')
    }

    $('#show-data-dialog').classList.remove('hide')
    $('#show-data-dialog>textarea').value = thingToShow
  },
  onmouseenter: event => {
    if (!userIsPressingCtrlKey) return
    event.target.style.cursor = 'pointer'
  },
  onmouseleave: event => {
    event.target.style.cursor = 'auto'
  },
  onmousemove: event => {
    if (userIsPressingCtrlKey) {
      event.target.style.cursor = 'pointer'
    } else {
      event.target.style.cursor = 'auto'
    }
  },
})

const columns = [
  'Row',
  {
    name: 'Key',
    attributes: cell => {
      if (cell) {
        return tdMouseEvents(cell)
      }
    },
  },
  {
    name: 'Value',
    attributes: cell => {
      if (cell) {
        return tdMouseEvents(cell)
      }
    },
  },
]

// eslint-disable-next-line complexity
function processDBData({ key, value }, index) {
  if (isBinaryBuffer(value)) {
    // Cant show the whole hex, it'd be too big
    value = 'hex:' + value.toString('hex').slice(0, 100) + '...'
  }
  if (isBinaryBuffer(key)) {
    key = 'hex:' + value.toString('hex').slice(0, 100) + '...'
  }
  if (value.length > 100) {
    value = value.slice(0, 100) + '...'
  }
  if (key.length > 100) {
    key = key.slice(0, 100) + '...'
  }

  const rowNumber = index + 1

  return [rowNumber, key, value]
}

// eslint-disable-next-line max-lines-per-function
$('#db-select-button').addEventListener('click', () => {
  const compression = $('#compression').checked
  const dbEncodingType = $('#database-encoding-type-select').value.trim()

  $('#largedb-loading-message').classList.remove('hide')

  // eslint-disable-next-line max-lines-per-function
  api.openNewDb(compression, dbEncodingType).then(dbData => {
    $('#largedb-loading-message').classList.add('hide')

    if (!dbData || dbData instanceof Error) {
      return
    }

    dbDataRenderStore = null
    indexedDBData = null

    dbDataRenderStore = new Map()

    dbData.items.forEach(({ key, value }) => {
      dbDataRenderStore.set(key, value)
    })

    indexedDBData = [...dbDataRenderStore.entries()]

    $('#db-path-location').textContent = dbData.dbFilePath

    const data = dbData.items.map(processDBData)

    if (!grid) {
      grid = new gridjs.Grid({
        columns: columns,
        data,
        search: true,
        height: 'calc(100vh - 10.2em)',
        pagination: {
          enabled: true,
          limit: 500,
        },
        language: {
          search: {
            placeholder: 'Search...',
          },
        },
        server: false,
      }).render(document.getElementById('grid-wrapper'))

      return
    }

    grid
      .updateConfig({
        columns: columns,
        data,
      })
      .forceRender()
  })
})
