import { readInputFileLines, mapInc } from '../../util'

type Coord = [number, number]

function toKey(x: number, y: number): string {
  return `${x},${y}`
}

function fromKey(key: string): Coord {
  const [x, y] = key.split(',')
  return [parseInt(x), parseInt(y)]
}

const DIRECTIONS: Coord[] = [
  [ 0, -1], // 0: N
  [ 1, -1], // 1: NE
  [ 1,  0], // 2: E
  [ 1,  1], // 3: SE
  [ 0,  1], // 4: S
  [-1,  1], // 5: SW
  [-1,  0], // 6: W
  [-1, -1]  // 7: NW
]
const MOVEMENT_OPTIONS: [Coord, Coord[]][] = [
  [DIRECTIONS[0], [DIRECTIONS[7], DIRECTIONS[0], DIRECTIONS[1]]],
  [DIRECTIONS[4], [DIRECTIONS[3], DIRECTIONS[4], DIRECTIONS[5]]],
  [DIRECTIONS[6], [DIRECTIONS[5], DIRECTIONS[6], DIRECTIONS[7]]],
  [DIRECTIONS[2], [DIRECTIONS[1], DIRECTIONS[2], DIRECTIONS[3]]],
]

function parseLine(line: string): ('.' | '#')[] {
  return line.split('') as ('.' | '#')[]
}

const inputs = readInputFileLines(__dirname, parseLine)
const elfPositions = new Set<string>()

for (let y = 0; y < inputs.length; y++) {
  for (let x = 0; x < inputs[y].length; x++) {
    if (inputs[y][x] === '#') {
      elfPositions.add(toKey(x, y))
    }
  }
}

// Which movement option should be considered first.
let firstMovementOption = 0

let round = 1

for (;;) {
  const proposedPositionByElf = new Map<string, string>()
  const proposedPositionCounts = new Map<string, number>()

  for (const elf of elfPositions) {
    const [x, y] = fromKey(elf)

    // Check whether this elf can even move (i.e. has another elf nearby)
    if (!DIRECTIONS.some(([dx, dy]) => elfPositions.has(toKey(x + dx, y + dy)))) {
      continue
    }

    // For each direction we can propose...
    for (let i = 0; i < MOVEMENT_OPTIONS.length; i++) {
      const [[proposedX, proposedY], checkDirections] = MOVEMENT_OPTIONS[(firstMovementOption + i) % MOVEMENT_OPTIONS.length]

      // Check that there are no elves in the way.
      if (checkDirections.some(([dx, dy]) => elfPositions.has(toKey(x + dx, y + dy)))) {
        continue
      }

      const proposedPosition = toKey(x + proposedX, y + proposedY)
      proposedPositionByElf.set(elf, proposedPosition)
      mapInc(proposedPositionCounts, proposedPosition, 1)
      break
    }
  }

  // If no elves want to move, we're finished.
  if (proposedPositionByElf.size === 0) {
    break
  }

  for (const [elf, proposedPosition] of proposedPositionByElf) {
    // Make sure the proposed position is not proposed by any other elves.
    if (proposedPositionCounts.get(proposedPosition) !== 1) {
      continue
    }

    // Move the elf.
    elfPositions.delete(elf)
    elfPositions.add(proposedPosition)
  }

  // Update the first movement option for next round.
  firstMovementOption++
  if (firstMovementOption === MOVEMENT_OPTIONS.length) {
    firstMovementOption = 0
  }

  round++
}

console.log(round)
