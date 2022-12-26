import assert from 'assert'
import { readInputFileLines, aStarSearch } from '../../util'

type Coord = [number, number]

function toKey(x: number, y: number): string {
  return `${x},${y}`
}

function fromKey(key: string): Coord {
  const [x, y] = key.split(',')
  return [parseInt(x), parseInt(y)]
}

const DIRECTIONS: Coord[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
]

interface InputLine {
  heights: number[]
  startX: number
  endX: number
}

function parseLine(line: string): InputLine {
  const letters = line.split('')
  const startX = letters.findIndex(h => h === 'S')
  const endX = letters.findIndex(h => h === 'E')
  const heights = letters.map(l => {
    if (l === 'S') {
      return 1
    }
    if (l === 'E') {
      return 26
    }
    const height = l.charCodeAt(0) - 96
    assert(height >= 1 && height <= 26)
    return height
  })
  return { heights, startX, endX }
}

const inputs = readInputFileLines(__dirname, parseLine)

let start = [-1, -1]
let end = [-1, -1]
const heightmap = new Map<string, number>()

for (let y = 0; y < inputs.length; y++) {
  const { heights, startX, endX } = inputs[y]

  if (startX >= 0) {
    start = [startX, y]
  }

  if (endX >= 0) {
    end = [endX, y]
  }

  for (let x = 0; x < heights.length; x++) {
    heightmap.set(toKey(x, y), heights[x])
  }
}

assert(start[0] >= 0 && start[1] >= 0)
assert(end[0] >= 0 && end[1] >= 0)

const path = aStarSearch({
  start: toKey(start[0], start[1]),

  isEnd: key => key === toKey(end[0], end[1]),

  getDistance: key => {
    const [x, y] = fromKey(key)
    return Math.abs(x - end[0]) + Math.abs(y - end[1])
  },

  getWeight: _ => 1,

  getNeighbours: key => {
    const [x, y] = fromKey(key)
    const height = heightmap.get(toKey(x, y))
    assert(height)
    const neighbours = [] as string[]

    for (const [dx, dy] of DIRECTIONS) {
      const key = toKey(x + dx, y + dy)
      const newHeight = heightmap.get(key)
      if (newHeight && newHeight - height <= 1) {
        neighbours.push(key)
      }
    }
    return neighbours
  }
})

console.log(path.length - 1)
