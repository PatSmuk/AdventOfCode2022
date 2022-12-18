import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return parseInt(line)
}

const inputs = readInputFileLines(__dirname, parseLine)

const elfCalories = []
let totalCalories = 0
for (const cals of inputs) {
  if (isNaN(cals)) {
    elfCalories.push(totalCalories)
    totalCalories = 0
  } else {
    totalCalories += cals
  }
}

console.log(Math.max(...elfCalories))
