export interface Monkey {
  items: number[]
  operation: (old: number) => number
  testDivisor: number
  divisbleTarget: number
  notDivisibleTarget: number
  inspections: number
}

const monkeys: Monkey[] = [
  {
    items: [79, 98],
    operation: (old: number) => old * 19,
    testDivisor: 23,
    divisbleTarget: 2,
    notDivisibleTarget: 3,
    inspections: 0
  },
  {
    items: [54, 65, 75, 74],
    operation: (old: number) => old + 6,
    testDivisor: 19,
    divisbleTarget: 2,
    notDivisibleTarget: 0,
    inspections: 0
  },
  {
    items: [79, 60, 97],
    operation: (old: number) => old * old,
    testDivisor: 13,
    divisbleTarget: 1,
    notDivisibleTarget: 3,
    inspections: 0
  },
  {
    items: [74],
    operation: (old: number) => old + 3,
    testDivisor: 17,
    divisbleTarget: 0,
    notDivisibleTarget: 1,
    inspections: 0
  }
]

const NUM_ROUNDS = 20

for (let round = 1; round <= NUM_ROUNDS; round++) {
  for (const monkey of monkeys) {
    while (monkey.items.length > 0) {
      monkey.inspections++

      let item = monkey.items.shift()!
      item = monkey.operation(item)
      item = Math.floor(item / 3)

      if (item % monkey.testDivisor === 0) {
        monkeys[monkey.divisbleTarget].items.push(item)
      } else {
        monkeys[monkey.notDivisibleTarget].items.push(item)
      }
    }
  }
}

const [first, second] = monkeys.map(m => m.inspections).sort((a, b) => b - a).slice(0, 2)
console.log(first * second)
