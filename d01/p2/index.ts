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

elfCalories.sort((a, b) => b - a)
console.log(elfCalories[0] + elfCalories[1] + elfCalories[2])
