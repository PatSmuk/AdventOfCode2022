import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return parseInt(line)
}

let state = readInputFileLines(__dirname, parseLine)

let order = [] as number[]
for (let i = 0; i < state.length; i++) {
  order.push(i)
}

for (let i = 0; i < state.length; i++) {
  let index = order.findIndex(x => x === i)
  const num = state[index]

  state.splice(index, 1)
  order.splice(index, 1)
  index = (index + num) % state.length
  state.splice(index, 0, num)
  order.splice(index, 0, i)
}

const zeroIndex = state.findIndex(x => x === 0)
console.log(state[(zeroIndex + 1000) % state.length])
console.log(state[(zeroIndex + 2000) % state.length])
console.log(state[(zeroIndex + 3000) % state.length])
console.log(state[(zeroIndex + 1000) % state.length] + state[(zeroIndex + 2000) % state.length] + state[(zeroIndex + 3000) % state.length])
