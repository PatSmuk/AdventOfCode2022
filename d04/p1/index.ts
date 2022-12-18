import { readInputFileLines } from '../../util'

function parseLine(line: string): number[][] {
  return line.split(',').map(part => part.split('-').map(x => parseInt(x)))
}

const inputs = readInputFileLines(__dirname, parseLine)
let numOverlapping = 0

for (const [[start1, end1], [start2, end2]] of inputs) {
  if ((start1 >= start2 && end1 <= end2) || (start2 >= start1 && end2 <= end1)) {
    numOverlapping++
  }
}

console.log(numOverlapping)
