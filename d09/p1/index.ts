import { readInputFileLines } from '../../util'

type Coord = [number, number]

const DIRECTION_VECTORS: {[direction: string]: Coord} = {
  U: [0, 1],
  D: [0, -1],
  L: [-1, 0],
  R: [1, 0]
}

// Table of how to move the tail given its position relative to the head.
const TAIL_MOVEMENTS: {[relativeCoords: string]: Coord} = {
  '-2,0': [1, 0],
  '2,0':  [-1, 0],
  '0,-2': [0, 1],
  '0,2':  [0, -1],
  '-1,-2': [1, 1],
  '1,-2': [-1, 1],
  '-1,2': [1, -1],
  '1,2': [-1, -1],
  '2,-1': [-1, 1],
  '2,1': [-1, -1],
  '-2,-1': [1, 1],
  '-2,1': [1, -1]
}

function parseLine(line: string): [Coord, number] {
  const parts = line.split(' ')
  return [DIRECTION_VECTORS[parts[0]], parseInt(parts[1])]
}

const inputs = readInputFileLines(__dirname, parseLine)

let head = [0, 0] as Coord
let tail = [0, 0] as Coord
const tailPositions = new Set<string>()

for (const [[dx, dy], steps] of inputs) {
  for (let step = 0; step < steps; step++) {
    // Move head.
    head[0] += dx
    head[1] += dy

    // Take difference between tail and head.
    const diffX = tail[0] - head[0]
    const diffY = tail[1] - head[1]

    // Check if tail needs to move and move it accordingly.
    const tailMovement = TAIL_MOVEMENTS[`${diffX},${diffY}`]
    if (tailMovement) {
      tail[0] += tailMovement[0]
      tail[1] += tailMovement[1]
    }

    tailPositions.add(`${tail[0]},${tail[1]}`)
  }
}

console.log(tailPositions.size)
