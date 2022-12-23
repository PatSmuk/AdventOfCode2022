import assert from 'assert'
import { readInputFileLines } from '../../util'

const NUM_ROCKS = 1000000000000

const ROCK_SHAPES: number[][] = [
  // ####
  [0,0,  1,0,  2,0,  3,0],

  // .#.
  // ###
  // .#.
  [1,2,  0,1,  1,1,  2,1,  1,0],

  // ..#
  // ..#
  // ###
  [0,0,  1,0,  2,0,  2,1,  2,2],

  // #
  // #
  // #
  // #
  [0,3,  0,2,  0,1,  0,0],

  // ##
  // ##
  [0,1,  1,1,  0,0,  1,0]
]

function toKey(x: number, y: number): number {
  return x | (y << 3)
}

function parseLine(line: string): number[] {
  return line.split('').map(x => x === '>' ? 1 : -1)
}

const gusts = readInputFileLines(__dirname, parseLine)[0]

const previouslySeen: Map<string, [number, number]>[][] = []
for (let i = 0; i < ROCK_SHAPES.length; i++) {
  const array: Map<string, [number, number]>[] = []
  for (let j = 0; j < gusts.length; j++) {
    array.push(new Map())
  }
  previouslySeen.push(array)
}

function occupiedToString(): string {
  let string = ''

  for (let y = tallestY; y >= 0; y--) {
    for (let x = 0; x < 7; x++) {
      if (occupiedSpaces[x][y]) {
        string += x
      }
    }
    string += '/'
  }

  return string
}

function findLowestReachableY(): number {
  const yCoordsVisitedByX: number[][] = [0, 1, 2, 3, 4, 5, 6].map(_ => [])
  yCoordsVisitedByX[0].push(tallestY + 1)

  function canVisit(x: number, y: number): boolean {
    if (occupiedSpaces[x][y]) {
      return false
    }
    for (const value of yCoordsVisitedByX[x]) {
      if (value === y) {
        return false
      }
    }
    return true
  }

  const spacesToVisit = [] as number[]
  spacesToVisit.push(toKey(0, tallestY + 1))

  let lowestReachableY = tallestY + 1

  while (spacesToVisit.length > 0) {
    const space = spacesToVisit.pop()!
    const x = space & 0b111
    const y = space >>> 3

    if (x > 0 && canVisit(x - 1, y)) {
      spacesToVisit.push(toKey(x - 1, y))
      yCoordsVisitedByX[x - 1].push(y)
    }
    if (x < 6 && canVisit(x + 1, y)) {
      spacesToVisit.push(toKey(x + 1, y))
      yCoordsVisitedByX[x + 1].push(y)
    }
    if (y > 0 && canVisit(x, y - 1)) {
      spacesToVisit.push(toKey(x, y - 1))
      yCoordsVisitedByX[x].push(y - 1)
    }
    if (y < tallestY + 1 && canVisit(x, y + 1)) {
      spacesToVisit.push(toKey(x, y + 1))
      yCoordsVisitedByX[x].push(y + 1)
    }

    if (y < lowestReachableY) {
      lowestReachableY = y
    }
  }

  return lowestReachableY
}

function removeUnreachableSpaces() {
  const diff = findLowestReachableY()

  if (diff > 0) {
    for (const array of occupiedSpaces) {
      for (let i = 0; i < (tallestY - diff + 1); i++) {
        array[i] = array[i + diff]
      }
      array.fill(0, tallestY - diff + 1)
    }

    tallestY -= diff
    shifts += diff
  }
}

function moveRock(rock: number[], dx: number, dy: number): boolean {
  for (let i = 0; i < rock.length; i += 2) {
    const x2 = rock[i + 0] + dx
    const y2 = rock[i + 1] + dy

    if (x2 < 0 || x2 >= 7 || y2 < 0 || occupiedSpaces[x2][y2]) {
      return false
    }
  }

  for (let i = 0; i < rock.length; i += 2) {
    rock[i + 0] += dx
    rock[i + 1] += dy
  }

  return true
}

const MAX_HEIGHT = 100
let occupiedSpaces = [0, 1, 2, 3, 4, 5, 6].map(_ => new Uint8Array(MAX_HEIGHT))
let tallestY = -1
let shifts = 0
let gustIndex = 0
let rockIndex = 0
let checkForSkip = true

for (let i = 0; i < NUM_ROCKS; i++) {
  if (checkForSkip) {
    const occupiedString = occupiedToString()

    if (previouslySeen[rockIndex][gustIndex].get(occupiedString)) {
      const [prevRock, prevTallestY] = previouslySeen[rockIndex][gustIndex].get(occupiedString)!
      const yDiff = (tallestY + shifts) - (prevTallestY)
      const iDiff = i - prevRock

      while (i < NUM_ROCKS) {
        i += iDiff
        shifts += yDiff
      }
      i -= iDiff
      shifts -= yDiff

      checkForSkip = false
    } else {
      previouslySeen[rockIndex][gustIndex].set(occupiedString, [i, tallestY + shifts])
    }
  }

  const rockShape = ROCK_SHAPES[rockIndex++]
  rockIndex %= ROCK_SHAPES.length
  const fallingRock = new Array(rockShape.length)

  for (let i = 0; i < rockShape.length; i += 2) {
    fallingRock[i + 0] = rockShape[i + 0] + 2
    fallingRock[i + 1] = rockShape[i + 1] + tallestY + 4
  }

  while (true) {
    const gust = gusts[gustIndex++]
    gustIndex %= gusts.length

    moveRock(fallingRock, gust, 0)
    const didFall = moveRock(fallingRock, 0, -1)

    if (!didFall) {
      for (let i = 0; i < fallingRock.length; i += 2) {
        if (fallingRock[i] === -1) {
          break
        }
        const x = fallingRock[i + 0]
        const y = fallingRock[i + 1]
        if (y > tallestY) {
          tallestY = y
        }
        assert(y < MAX_HEIGHT, 'ran out of height')
        occupiedSpaces[x][y] = 1
      }
      break
    }
  }

  removeUnreachableSpaces()
}

console.log(tallestY + shifts + 1)
