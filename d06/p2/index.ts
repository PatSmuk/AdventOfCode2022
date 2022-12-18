import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line
}

const input = readInputFileLines(__dirname, parseLine)[0]

for (let i = 0; i < input.length; i++) {
  const letters = new Set(input.slice(i, i + 14).split(''))
  if (letters.size === 14) {
    console.log(i + 14)
    break
  }
}
