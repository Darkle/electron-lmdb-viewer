// @ts-nocheck

const grid = new gridjs.Grid({
  columns: ['Key', 'Value'],
  data: [[null, null]],
  search: true,
  language: {
    search: {
      placeholder: 'Search...',
    },
  },
  server: false,
}).render(document.getElementById('grid-wrapper'))

document.querySelector('#db-select-button').addEventListener('click', () => {
  const compression = document.querySelector('#compression').checked
  const dbEncodingType = document.querySelector('#database-encoding-type-select').value.trim()

  api.openNewDb(compression, dbEncodingType).then(dbData => {
    document.querySelector('#db-path-location').textContent = dbData.dbFilePath

    grid
      .updateConfig({ columns: ['Key', 'Value'], data: dbData.items.map(({ key, value }) => [key, value]) })
      .forceRender()
  })
})
