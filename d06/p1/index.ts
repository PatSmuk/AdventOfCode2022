import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line
}

const input = readInputFileLines(__dirname, parseLine)[0]

for (let i = 0; i < input.length; i++) {
  const letters = new Set(input.slice(i, i + 4).split(''))
  if (letters.size === 4) {
    console.log(i + 4)
    break
  }
}
