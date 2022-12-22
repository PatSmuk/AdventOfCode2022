import assert from 'assert'
import { readInputFileLines } from '../../util'
import { Direction, Instruction, parseLine } from '../util'

function toKey(x: number, y: number) {
  return `${x},${y}`
}

const inputs = readInputFileLines(__dirname, parseLine)

const wallMap = new Map<string, boolean>()
let instructions: Instruction[] | undefined
// Remember the right and bottom edge of the map so we can teleport to them later.
let rightEdge = 0
let bottomEdge = 0

for (let y = 0; y < inputs.length; y++) {
  const input = inputs[y]

  // Next line after empty one is instructions.
  if (input === null) {
    instructions = inputs[y + 1] as any
    break
  }

  bottomEdge = y
  const tiles = input as string
  rightEdge = Math.max(rightEdge, tiles.length - 1)

  // Add tiles to the wall map.
  for (let x = 0; x < tiles.length; x++) {
    if (tiles[x] !== ' ') {
      wallMap.set(toKey(x, y), tiles[x] === '#' ? true : false)
    }
  }
}
assert(instructions)

const DIRECTION_VECTORS = [[1, 0], [0, 1], [-1, 0], [0, -1]]

let x = 0
let y = 0
let direction = Direction.RIGHT

// Find the first space in the top row that is not a wall.
while (wallMap.get(toKey(x, y)) !== false) {
  x++
}

for (const instruction of instructions) {
  // Handle direction changes first.
  if (typeof instruction === 'string') {
    if (instruction === 'R') {
      direction++
    } else {
      direction--
    }
    // Ensure it stays within 0..(DIRECTIONS.length-1)
    direction += DIRECTION_VECTORS.length
    direction %= DIRECTION_VECTORS.length
    continue
  }

  const [dx, dy] = DIRECTION_VECTORS[direction]

  // For each step...
  for (let step = 0; step < instruction; step++) {
    // Save original coords in case we hit a wall.
    const startX = x
    const startY = y

    // Update X and Y according to the direction we're going.
    x += dx
    y += dy

    // If we hit a wall, go back to where we were and stop moving.
    const isWall = wallMap.get(toKey(x, y))
    if (isWall) {
      x = startX
      y = startY
      break
    }

    // If we go out of bounds...
    if (isWall === undefined) {
      // Teleport to opposite side of the map.
      switch (direction) {
        case Direction.RIGHT: x = 0; break
        case Direction.DOWN: y = 0; break
        case Direction.LEFT: x = rightEdge; break
        case Direction.UP: y = bottomEdge; break
      }

      // Until we hit the map, keep going in our direction.
      while (wallMap.get(toKey(x, y)) === undefined) {
        x += dx
        y += dy
      }

      // If we immediately hit a wall, go back to where we were originally and stop moving.
      if (wallMap.get(toKey(x, y))) {
        x = startX
        y = startY
        break
      }
    }
  }
}

console.log((y + 1) * 1000 + (x + 1) * 4 + direction)
