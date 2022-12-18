import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  if (!line.startsWith('move')) {
    // "[R] [T] [T] [R] [G] [W] [F] [W] [L]" etc.
    //   1   5   9...
    // ['R', 'T', 'T', ...]
    const parts = []
    for (let i = 1; i <= line.length; i += 4) {
      parts.push(line[i])
    }
    return parts
  } else {
    // "move X from Y to Z"
    // ['move', 'X', 'from', 'Y', 'to', 'Z']
    // [NaN, X, NaN, Y, NaN, Z]
    // [X, Y, Z]
    return line.split(' ').map(x => parseInt(x)).filter(x => !isNaN(x))
  }
}

const inputs = readInputFileLines(__dirname, parseLine)
const stacks: string[][] = []
let firstInstructionIndex = 0

for (let i = 0; i < inputs.length; i++) {
  // Find the empty line
  if (inputs[i].length === 0) {
    // First instruction is the next line
    firstInstructionIndex = i + 1

    // Previous line is ['1', '2', '3', '4', ...]
    for (let j = 0; j < inputs[i-1].length; j++) {
      stacks.push([])
    }

    // Two lines previous is the bottom of the stack,
    //   before that is next from bottom, etc.
    for (let j = i - 2; j >= 0; j--) {
      const crates = inputs[j] as string[]
      for (let k = 0; k < crates.length; k++) {
        if (crates[k] !== ' ') {
          stacks[k].push(crates[k])
        }
      }
    }
  }
}

for (let i = firstInstructionIndex; i < inputs.length; i++) {
  const [count, source, dest] = inputs[i] as number[]

  for (let j = 0; j < count; j++) {
    const crate = stacks[source - 1].pop()!
    stacks[dest - 1].push(crate)
  }
}

// Combine last crate of each stack
console.log(stacks.map(s => s[s.length - 1]).join(''))
