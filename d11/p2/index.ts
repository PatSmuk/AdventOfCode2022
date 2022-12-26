import assert from 'assert'

type Item = Map<number, number>
type Operation = (old: number) => number

const DIVISORS = [23, 19, 13, 17]

function I(n: number): Item {
  const item = new Map<number, number>()

  for (const divisor of DIVISORS) {
    item.set(divisor, n % divisor)
  }

  return item
}

function applyOperation(item: Item, operation: Operation) {
  for (const [divisor, old] of item.entries()) {
    item.set(divisor, operation(old) % divisor)
  }
}

interface Monkey {
  items: Item[]
  operation: (old: number) => number
  divisbleTarget: number
  notDivisibleTarget: number
  inspections: number
}

const monkeys: Monkey[] = [
  {
    items: [I(79), I(98)],
    operation: (old: number) => old * 19,
    divisbleTarget: 2,
    notDivisibleTarget: 3,
    inspections: 0
  },
  {
    items: [I(54), I(65), I(75), I(74)],
    operation: (old: number) => old + 6,
    divisbleTarget: 2,
    notDivisibleTarget: 0,
    inspections: 0
  },
  {
    items: [I(79), I(60), I(97)],
    operation: (old: number) => old * old,
    divisbleTarget: 1,
    notDivisibleTarget: 3,
    inspections: 0
  },
  {
    items: [I(74)],
    operation: (old: number) => old + 3,
    divisbleTarget: 0,
    notDivisibleTarget: 1,
    inspections: 0
  }
]

assert(monkeys.length === DIVISORS.length)

const NUM_ROUNDS = 10000

for (let round = 1; round <= NUM_ROUNDS; round++) {
  for (let i = 0; i < monkeys.length; i++) {
    const monkey = monkeys[i]
    const divisor = DIVISORS[i]

    while (monkey.items.length > 0) {
      monkey.inspections++

      const item = monkey.items.shift()!
      applyOperation(item, monkey.operation)

      if (item.get(divisor) === 0) {
        monkeys[monkey.divisbleTarget].items.push(item)
      } else {
        monkeys[monkey.notDivisibleTarget].items.push(item)
      }
    }
  }
}

const [first, second] = monkeys.map(m => m.inspections).sort((a, b) => b - a).slice(0, 2)
console.log(first * second)
