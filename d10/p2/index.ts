import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  const parts = line.split(' ')
  if (parts.length === 1) {
    return [0]
  }
  return [0, parseInt(parts[1])]
}

const LINE_LENGTH = 40

// Flatten into single array of deltas.
const inputs = readInputFileLines(__dirname, parseLine).flat()

let line = ''
for (let cycle = 0; cycle < inputs.length; cycle++) {
  const x = cycle % LINE_LENGTH
  const xRegister = inputs.slice(0, cycle).reduce((prev, curr) => prev + curr, 1)

  if (Math.abs(xRegister - x) <= 1) {
    line += '#'
  } else {
    line += '.'
  }

  // If we're at the end of the line, print it and reset.
  if (x === LINE_LENGTH - 1) {
    console.log(line)
    line = ''
  }
}
