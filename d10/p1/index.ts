import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  const parts = line.split(' ')

  // Handle "nop"
  if (parts.length === 1) {
    return [0]
  }

  // Handle "addx <amount>"
  return [0, parseInt(parts[1])]
}

// Flatten into single array of deltas.
const inputs = readInputFileLines(__dirname, parseLine).flat()

let signalStrengthSum = 0
for (let cycle = 20; cycle <= 220; cycle += 40) {
  const signalStrength = inputs.slice(0, cycle - 1).reduce((x, dx) => x + dx, 1)
  signalStrengthSum += cycle * signalStrength
}

console.log(signalStrengthSum)
