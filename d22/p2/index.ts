import assert from 'assert'
import { readInputFileLines } from '../../util'
import { Direction, Instruction, parseLine } from '../util'

function toKey(face: string, x: number, y: number) {
  return `${face},${x},${y}`
}

const SIDE_MAX = 50

// Placement of the faces in the input data.
// I hardcoded this for the input I got,
//   your input might be a different shape.
//     ¯\_(ツ)_/¯
const FACE_PLACEMENT_MAP = [
  [null, 'A', 'B'],
  [null, 'C', null],
  ['E', 'D', null],
  ['F', null, null]
]

// Maps from face local coords to original flat coords, basically just FACE_PLACEMENT_MAP again.
const FACE_COORD_TO_ORIGINAL_COORD: {[face: string]: (x: number, y: number) => [number, number]} = {
  'A': (x, y) => [x + SIDE_MAX * 1, y + SIDE_MAX * 0],
  'B': (x, y) => [x + SIDE_MAX * 2, y + SIDE_MAX * 0],
  'C': (x, y) => [x + SIDE_MAX * 1, y + SIDE_MAX * 1],
  'D': (x, y) => [x + SIDE_MAX * 1, y + SIDE_MAX * 2],
  'E': (x, y) => [x + SIDE_MAX * 0, y + SIDE_MAX * 2],
  'F': (x, y) => [x + SIDE_MAX * 0, y + SIDE_MAX * 3],
}

// Maps from the edge of each face to the edge of another face.
// Again, based on FACE_PLACEMENT_MAP specifically.
const FACE_EDGE_MAP = new Map<string, string>([
  ['A,top',     'F,left'],
  ['A,bottom',  'C,top'],
  ['A,left',    'E,left'],
  ['A,right',   'B,left'],
  ['B,top',     'F,bottom'],
  ['B,bottom',  'C,right'],
  ['B,right',   'D,right'],
  ['C,bottom',  'D,top'],
  ['C,left',    'E,top'],
  ['D,bottom',  'F,right'],
  ['D,left',    'E,right'],
  ['E,bottom',  'F,top'],
])
// Do the reverse mapping as well.
for (const [edge1, edge2] of FACE_EDGE_MAP.entries()) {
  FACE_EDGE_MAP.set(edge2, edge1)
}

// Maps from the direction we were going to which edge we fell off of.
const DIRECTION_TO_LEAVING_EDGE = ['right', 'bottom', 'left', 'top']

// Maps from the edge we end up on to the new direction.
const ENTERING_EDGE_TO_DIRECTION: {[edge: string]: Direction} = {
  top: Direction.DOWN,
  bottom: Direction.UP,
  right: Direction.LEFT,
  left: Direction.RIGHT
}

// Transition functions to go from source edge to destination edge.
// I only defined the transitions I actually had in FACE_EDGE_MAP.
const EDGE_TRANSITIONS: {[sourceEdge: string]: {[destEdge: string]: (x: number, y: number) => [number, number]}} = {
  top: {
    left: (x, _) => [0, x],
    bottom: (x, _) => [x, SIDE_MAX-1]
  },
  bottom: {
    top: (x, _) => [x, 0],
    right: (x, _) => [SIDE_MAX-1, x]
  },
  left: {
    left: (_, y) => [0, SIDE_MAX-1 - y],
    top: (_, y) => [y, 0],
    right: (_, y) => [SIDE_MAX-1, y]
  },
  right: {
    right: (_, y) => [SIDE_MAX-1, SIDE_MAX-1 - y],
    left: (_, y) => [0, y],
    bottom: (_, y) => [y, SIDE_MAX-1]
  }
}

const lines = readInputFileLines(__dirname, parseLine)

const wallMap = new Map<string, boolean>()
let instructions: Instruction[] | undefined

for (let y = 0; y < lines.length; y++) {
  const line = lines[y]

  // Next line after empty one is instructions.
  if (line === null) {
    instructions = lines[y + 1] as Instruction[]
    break
  }

  const tiles = line as string

  for (let x = 0; x < tiles.length; x++) {
    if (tiles[x] !== ' ') {
      const isWall = tiles[x] === '#'
      // Convert from flat coords to face-local coords.
      const face = FACE_PLACEMENT_MAP[Math.floor(y / SIDE_MAX)][Math.floor(x / SIDE_MAX)]
      assert(face)
      wallMap.set(toKey(face, x % SIDE_MAX, y % SIDE_MAX), isWall)
    }
  }
}
assert(instructions)

const DIRECTION_VECTORS = [[1, 0], [0, 1], [-1, 0], [0, -1]]

let face = 'A'
let x = 0
let y = 0
let direction = Direction.RIGHT

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

  // For each step...
  for (let step = 0; step < instruction; step++) {
    // Save original coords in case we hit a wall.
    const startX = x
    const startY = y

    // Update X and Y according to the direction we're going.
    const [dx, dy] = DIRECTION_VECTORS[direction]
    x += dx
    y += dy

    // If we hit a wall, go back to where we were and stop moving.
    const isWall = wallMap.get(toKey(face, x, y))
    if (isWall) {
      x = startX
      y = startY
      break
    }

    // If we go out of bounds, we need to transition to another face.
    if (isWall === undefined) {
      // Figure out which edge we're leaving.
      const edge = DIRECTION_TO_LEAVING_EDGE[direction]

      // Figure out which face and edge we're heading to.
      const destination = FACE_EDGE_MAP.get(`${face},${edge}`)
      assert(destination)
      const [newFace, newEdge] = destination.split(',')

      // Run mapping function to get new X, Y, and direction.
      const [newX, newY] = EDGE_TRANSITIONS[edge][newEdge](x, y)
      const newDirection = ENTERING_EDGE_TO_DIRECTION[newEdge]

      // If we immediately hit a wall, don't do the face transition.
      if (wallMap.get(toKey(newFace, newX, newY))) {
        x = startX
        y = startY
        break
      }

      // Switch to the new face.
      x = newX
      y = newY
      face = newFace
      direction = newDirection
    }
  }
}

const [ox, oy] = FACE_COORD_TO_ORIGINAL_COORD[face](x, y)
console.log((oy + 1) * 1000 + (ox + 1) * 4 + direction)
