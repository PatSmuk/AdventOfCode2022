import { readInputFileLines } from '../../util'
import { List, Result, parseLine, compareList } from '../util'

const inputs = readInputFileLines(__dirname, parseLine)
let sum = 0

for (let i = 0; i < inputs.length; i += 3) {
  const packet1 = inputs[i + 0] as List
  const packet2 = inputs[i + 1] as List

  const result = compareList(packet1, packet2)
  if (result === Result.IN_ORDER) {
    // Adjust i from [0, 3, 6, 9, ...] to [1, 2, 3, 4, ...]
    sum += i / 3 + 1
  }
}

console.log(sum)
