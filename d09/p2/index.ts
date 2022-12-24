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
  '-2,1': [1, -1],
  // Need these diagonal movements too since tail segments can move diagonally.
  '-2,-2': [1, 1],
  '-2,2': [1, -1],
  '2,-2': [-1, 1],
  '2,2': [-1, -1]
}

function parseLine(line: string): [Coord, number] {
  const parts = line.split(' ')
  return [DIRECTION_VECTORS[parts[0]], parseInt(parts[1])]
}

const inputs = readInputFileLines(__dirname, parseLine)

let head = [0, 0] as Coord
const tails = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(_ => [0, 0] as Coord)
const tailPositions = new Set<string>()

for (const [[dx, dy], steps] of inputs) {
  for (let step = 0; step < steps; step++) {
    // Move head.
    head[0] += dx
    head[1] += dy

    // For each tail segment, move it relative to the previous segment.
    let previous = head
    for (const tail of tails) {
      const diffX = tail[0] - previous[0]
      const diffY = tail[1] - previous[1]

      const tailMovement = TAIL_MOVEMENTS[`${diffX},${diffY}`]
      if (tailMovement) {
        tail[0] += tailMovement[0]
        tail[1] += tailMovement[1]
      }

      previous = tail
    }

    tailPositions.add(`${tails[8][0]},${tails[8][1]}`)
  }
}

console.log(tailPositions.size)
