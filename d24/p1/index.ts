import { readInputFileLines, aStarSearch } from '../../util'

type Coord = [number, number]

function toKey(x: number, y: number, min: number): string {
  return `${x},${y},${min}`
}

function fromKey(key: string): [number, number, number] {
  return key.split(',').map(x => parseInt(x)) as [number, number, number]
}

function parseLine(line: string) {
  return line.split('') as ('#' | '.' | '>' | 'v' | '<' | '^')[]
}

const CHAR_TO_DIRECTION: {[char: string]: Coord} = {
  '>': [1, 0],
  '<': [-1, 0],
  'v': [0, 1],
  '^': [0, -1]
}
const MOVEMENT_CHOICES = Object.values(CHAR_TO_DIRECTION)
// Not moving is also a valid choice.
MOVEMENT_CHOICES.push([0, 0])

interface Blizzard {
  x: number
  y: number
  direction: Coord
}

const inputs = readInputFileLines(__dirname, parseLine)

const minY = 1
const maxY = inputs.length - 2
const minX = 1
const maxX = inputs[0].length - 2

const blizzards = [] as Blizzard[]
const blizzardPositions = [] as Set<string>[]

// Initialize blizzards from input.
let y = 0
for (const line of inputs) {
  for (let x = 0; x < line.length; x++) {
    const direction = CHAR_TO_DIRECTION[line[x]]
    if (direction) {
      blizzards.push({ x, y, direction })
    }
  }
  y++
}

// Simulates a single blizzard movement cycle.
function simulateBlizzardCycle() {
  const positions = new Set<string>()

  for (const blizzard of blizzards) {
    blizzard.x += blizzard.direction[0]
    blizzard.y += blizzard.direction[1]

    if (blizzard.x < minX) {
      blizzard.x = maxX
    } else if (blizzard.x > maxX) {
      blizzard.x = minX
    }

    if (blizzard.y < minY) {
      blizzard.y = maxY
    } else if (blizzard.y > maxY) {
      blizzard.y = minY
    }

    positions.add(`${blizzard.x},${blizzard.y}`)
  }

  blizzardPositions.push(positions)
}

function findPathThroughBlizzards(startX: number, startY: number, endX: number, endY: number, startMin: number): string[] {
  return aStarSearch({
    start: toKey(startX, startY, startMin),

    isEnd: key => {
      const [x, y] = fromKey(key)
      return x === endX && y === endY
    },

    getDistance: key => {
      const [x, y] = fromKey(key)
      return (endX - x) + (endY - y)
    },

    getWeight: _ => 1,

    getNeighbours: key => {
      const [x, y, min] = fromKey(key)

      // Simulate the blizzards until we have the data we need.
      while (blizzardPositions[min + 1] === undefined) {
        simulateBlizzardCycle()
      }
      const blockedSpaces = blizzardPositions[min + 1]

      // Start position.
      if (x === minX && y === minY - 1) {
        // Always safe to stay in start position.
        const neighbours = [toKey(x, y, min + 1)]

        if (!blockedSpaces.has(`${x},${y + 1}`)) {
          neighbours.push(toKey(x, y + 1, min + 1))
        }
        return neighbours
      }
      // End position.
      if (x === maxX && y === maxY + 1) {
        // Always safe to stay in end position.
        const neighbours = [toKey(x, y, min + 1)]

        if (!blockedSpaces.has(`${x},${y - 1}`)) {
          neighbours.push(toKey(x, y - 1, min + 1))
        }
        return neighbours
      }

      const neighbours = []
      for (const [dx, dy] of MOVEMENT_CHOICES) {
        const x2 = x + dx
        const y2 = y + dy

        // Bounds check, going outside Y allowed to reach start and end positions.
        if (x2 < minX || x2 > maxX || (y < minY && x2 !== minX) || (y > maxY && x2 !== maxX)) {
          continue
        }

        if (!blockedSpaces.has(`${x2},${y2}`)) {
          neighbours.push(toKey(x2, y2, min + 1))
        }
      }

      return neighbours
    }
  })
}

const startX = minX
const startY = minY - 1
const endX = maxX
const endY = maxY + 1

const path = findPathThroughBlizzards(startX, startY, endX, endY, 0)

console.log(path.length)
