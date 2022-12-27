import { readInputFileLines, Coord } from '../../util'

function parseLine(line: string) {
  const pairs = line.split(' -> ')
  return pairs.map(p => p.split(',').map(x => parseInt(x)))
}

const rocks = new Set<string>()
const sandUnits = new Set<string>()
function isBlocked(coord: Coord) {
  return rocks.has(coord.toString()) || sandUnits.has(coord.toString())
}
let lowestRockY = Number.NEGATIVE_INFINITY

const lines = readInputFileLines(__dirname, parseLine)
for (const linePoints of lines) {
  for (let i = 0; i < linePoints.length - 1; i++) {
    const [startX, startY] = linePoints[i]
    const [endX, endY] = linePoints[i + 1]

    let dx = endX - startX
    let dy = endY - startY
    let steps = 0
    if (dx !== 0) {
      steps = Math.abs(dx)
      dx /= steps
    } else {
      steps = Math.abs(dy)
      dy /= steps
    }

    let x = startX
    let y = startY
    rocks.add(`${x},${y}`)
    lowestRockY = Math.max(lowestRockY, y)

    for (let step = 0; step < steps; step++) {
      x += dx
      y += dy
      rocks.add(`${x},${y}`)
      lowestRockY = Math.max(lowestRockY, y)
    }
  }
}

fellOffEdge: for (;;) {
  let sandX = 500
  let sandY = 0

  for (;;) {
    let dest = new Coord(sandX, sandY + 1)
    if (isBlocked(dest)) {
      dest = new Coord(sandX - 1, sandY + 1)

      if (isBlocked(dest)) {
        dest = new Coord(sandX + 1, sandY + 1)

        if (isBlocked(dest)) {
          sandUnits.add(`${sandX},${sandY}`)
          break
        }
      }
    }

    sandX = dest.x
    sandY = dest.y

    if (sandY > lowestRockY) {
      break fellOffEdge
    }
  }
}

console.log(sandUnits.size)
