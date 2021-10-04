// @ts-nocheck

const $$ = q => Array.from(document.querySelectorAll(q))
const $ = document.querySelector.bind(document)

let grid = null

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

const tdMouseEvents = cell => ({
  onclick: () => {
    if (!userIsPressingCtrlKey) return
    api.copyToClipBoard(cell)
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

function processDBData({ key, value }, index) {
  if (isBinaryBuffer(value)) {
    // Cant show the whole hex, it'd be too big
    value = 'hex:' + value.toString('hex').slice(0, 100) + '...'
  }
  if (isBinaryBuffer(key)) {
    key = 'hex:' + value.toString('hex').slice(0, 100) + '...'
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
