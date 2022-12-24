import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line.split('').map(x => parseInt(x))
}

const rows = readInputFileLines(__dirname, parseLine)
let highestScenicScore = 0

for (let y = 1; y < rows.length - 1; y++) {
  const row = rows[y]

  for (let x = 1; x < row.length - 1; x++) {
    let height = row[x]
    let scenicScore = 1

    // Check how many trees can be seen to the west.
    let x2 = x - 1
    while (row[x2] < height && x2 > 0) {
      x2--
    }
    scenicScore *= x - x2

    // Check how many trees can be seen to the east.
    x2 = x + 1
    while (row[x2] < height && x2 < row.length - 1) {
      x2++
    }
    scenicScore *= x2 - x

    // Check how many trees can be seen to the north.
    let y2 = y - 1
    while (rows[y2][x] < height && y2 > 0) {
      y2--
    }
    scenicScore *= y - y2

    // Check how many trees can be seen to the south.
    y2 = y + 1
    while (rows[y2][x] < height && y2 < rows.length - 1) {
      y2++
    }
    scenicScore *= y2 - y

    highestScenicScore = Math.max(scenicScore, highestScenicScore)
  }
}

console.log(highestScenicScore)
