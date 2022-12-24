import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line.split('').map(x => parseInt(x))
}

const rows = readInputFileLines(__dirname, parseLine)

// Outer ring of trees is visible.
let numVisible = rows.length * 2 + (rows[0].length - 2) * 2

for (let y = 1; y < rows.length - 1; y++) {
  const row = rows[y]
  for (let x = 1; x < row.length - 1; x++) {
    const height = row[x]

    // Check visibility from the north.
    let isVisible = true
    for (let y2 = y - 1; y2 >= 0; y2--) {
      if (rows[y2][x] >= height) {
        isVisible = false
        break
      }
    }
    if (isVisible) {
      numVisible++
      continue
    }

    // Check visibility from the west.
    isVisible = true
    for (let x2 = x - 1; x2 >= 0; x2--) {
      if (row[x2] >= height) {
        isVisible = false
        break
      }
    }
    if (isVisible) {
      numVisible++
      continue
    }

    // Check visibility from the south.
    isVisible = true
    for (let y2 = y + 1; y2 < rows.length; y2++) {
      if (rows[y2][x] >= height) {
        isVisible = false
        break
      }
    }
    if (isVisible) {
      numVisible++
      continue
    }

    // Check visibility from the east.
    isVisible = true
    for (let x2 = x + 1; x2 < rows[0].length; x2++) {
      if (row[x2] >= height) {
        isVisible = false
        break
      }
    }
    if (isVisible) {
      numVisible++
    }
  }
}

console.log(numVisible)
