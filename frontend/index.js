// @ts-nocheck
import { Grid } from 'gridjs'

const grid = new Grid().render(document.getElementById('wrapper'))

grid.updateConfig({
  columns: ['Name', 'Email', 'Phone Number'],
  data: [
    ['John', 'john@example.com', '(353) 01 222 3333'],
    ['Mark', 'mark@gmail.com', '(01) 22 888 4444'],
  ],
})
