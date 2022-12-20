import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return BigInt(line) * 811589153n
}

let state = readInputFileLines(__dirname, parseLine)
const numInputs = BigInt(state.length - 1)

let order = [] as number[]
for (let i = 0; i < state.length; i++) {
  order.push(i)
}

for (let mix = 0; mix < 10; mix++) {
  for (let i = 0; i < state.length; i++) {
    let index = order.findIndex(x => x === i)
    const num = state[index]

    state.splice(index, 1)
    order.splice(index, 1)
    index = Number((BigInt(index) + num) % numInputs)
    state.splice(index, 0, num)
    order.splice(index, 0, i)
  }
}

const zeroIndex = state.findIndex(x => x === 0n)
console.log(state[(zeroIndex + 1000) % state.length])
console.log(state[(zeroIndex + 2000) % state.length])
console.log(state[(zeroIndex + 3000) % state.length])
console.log(state[(zeroIndex + 1000) % state.length] + state[(zeroIndex + 2000) % state.length] + state[(zeroIndex + 3000) % state.length])
