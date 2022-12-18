import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line
}

const inputs = readInputFileLines(__dirname, parseLine)
console.log(JSON.stringify(inputs, null, 2))
