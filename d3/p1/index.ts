import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return [
    new Set(line.slice(0, line.length / 2).split('')),
    new Set(line.slice(line.length / 2).split(''))
  ]
}

function charToPriority(char: string): number {
  const code = char.charCodeAt(0)

  if (code >= 0x41 && code <= 0x5a) {
    // Uppercase
    return code - 0x41 + 27
  } else {
    // Lowercase
    return code - 0x61 + 1
  }
}

const inputs = readInputFileLines(__dirname, parseLine)
let sum = 0

for (const [left, right] of inputs) {
  for (const char of left) {
    if (right.has(char)) {
      sum += charToPriority(char)
    }
  }
}

console.log(sum)
