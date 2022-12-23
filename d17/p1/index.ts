import clone from 'clone-deep'
import { readInputFileLines } from '../../util'

type Direction = '<' | '>'
type Coord = [number, number]

const NUM_ROCKS = 2022

const ROCK_SHAPES: Coord[][] = [
  // ####
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  // .#.
  // ###
  // .#.
  [[1, 2], [0, 1], [1, 1], [2, 1], [1, 0]],
  // ..#
  // ..#
  // ###
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  // #
  // #
  // #
  // #
  [[0, 3], [0, 2], [0, 1], [0, 0]],
  // ##
  // ##
  [[0, 1], [1, 1], [0, 0], [1, 0]]
]

function toKey(coord: Coord): string {
  return `${coord[0]},${coord[1]}`
}

function parseLine(line: string): Direction[] {
  return line.split('') as Direction[]
}

const gusts = readInputFileLines(__dirname, parseLine)[0]

const occupiedSpaces = new Set<string>()
let tallestY = 0
let gustIndex = 0
let rockIndex = 0

function debugDraw() {
  for (let y = tallestY; y >= 1; y--) {
    let line = '|'
    for (let x = 1; x <= 7; x++) {
      if (occupiedSpaces.has(toKey([x, y]))) {
        line += '#'
      } else {
        line += '.'
      }
    }
    console.log(line + '|')
  }
  console.log('+-------+\n\n')
}

function moveRock(rock: Coord[], dx: number, dy: number): Coord[] {
  const movedRock = rock.map(([x, y]) => [x + dx, y + dy] as Coord)

  for (const coord of movedRock) {
    // Bounds check
    if (coord[0] < 1 || coord[0] > 7 || coord[1] < 1) {
      return rock
    }
    // Collision check
    if (occupiedSpaces.has(toKey(coord))) {
      return rock
    }
  }

  return movedRock
}

for (let i = 0; i < NUM_ROCKS; i++) {
  let fallingRock = moveRock(clone(ROCK_SHAPES[rockIndex++]), 3, tallestY + 4)
  rockIndex %= ROCK_SHAPES.length

  while (true) {
    const gust = gusts[gustIndex++]
    gustIndex %= gusts.length

    fallingRock = moveRock(fallingRock, gust === '>' ? 1 : -1, 0)
    const fallenRock = moveRock(fallingRock, 0, -1)

    if (fallenRock === fallingRock) {
      for (const coord of fallingRock) {
        tallestY = Math.max(tallestY, coord[1])
        occupiedSpaces.add(toKey(coord))
      }
      break
    }

    fallingRock = fallenRock
  }

  // debugDraw()
}

console.log(tallestY)
