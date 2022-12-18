import { readInputFileLines } from '../../util'
import { batch } from 'iter-tools'

function parseLine(line: string) {
  return new Set(line.split(''))
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

for (const [elf1, elf2, elf3] of batch(3, inputs)) {
  for (const char of elf1) {
    if (elf2.has(char) && elf3.has(char)) {
      sum += charToPriority(char)
    }
  }
}

console.log(sum)
