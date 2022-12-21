import { readInputFileLines } from '../../util'

interface ConstantMonkey {
  name: string
  operator: 'const'
  value: number
}

interface DerivedMonkey {
  name: string
  operator: '+' | '-' | '/' | '*'
  left: string
  right: string
}

type Monkey = ConstantMonkey | DerivedMonkey

function parseLine(line: string): Monkey {
  const parts = line.split(' ')
  const name = parts[0].substring(0, parts[0].length - 1)

  if (parts.length === 2) {
    return {
      name,
      operator: 'const',
      value: parseInt(parts[1])
    }
  }

  return {
    name,
    operator: parts[2] as '+' | '-' | '/' | '*',
    left: parts[1],
    right: parts[3]
  }
}

const human = Symbol('human')
type Human = typeof human

interface HumanDerivedMonkey {
  name: string
  operator: '+' | '-' | '/' | '*'
  left: ResolvedValue
  right: ResolvedValue
  shouldEqual?: number
}
type ResolvedValue = HumanDerivedMonkey | Human | number

const inputs = readInputFileLines(__dirname, parseLine)
const resolvedMonkeys = new Map<string, ResolvedValue>()
const unresolvedMonkeys = new Set<DerivedMonkey>()

for (const monkey of inputs) {
  if (monkey.operator === 'const') {
    // If the monkey's name is "humn" then resolve to special human symbol
    resolvedMonkeys.set(monkey.name, monkey.name === 'humn' ? human : monkey.value)
  } else {
    unresolvedMonkeys.add(monkey)
  }
}

while (unresolvedMonkeys.size > 0) {
  for (const monkey of unresolvedMonkeys) {
    let left = resolvedMonkeys.get(monkey.left)
    let right = resolvedMonkeys.get(monkey.right)

    if (left !== undefined && right !== undefined) {
      unresolvedMonkeys.delete(monkey)

      let value: number | HumanDerivedMonkey

      // If either side is derived from human...
      if (typeof left !== 'number' || typeof right !== 'number') {
        value = {
          name: monkey.name,
          operator: monkey.operator,
          left,
          right
        }
      } else {
        // Both sides are constants, calculate now.
        switch (monkey.operator) {
          case '+': value = left + right; break
          case '-': value = left - right; break
          case '*': value = left * right; break
          case '/': value = left / right; break
        }
      }

      resolvedMonkeys.set(monkey.name, value)
    }
  }
}

let nextMonkey: HumanDerivedMonkey | null
const root = resolvedMonkeys.get('root')! as HumanDerivedMonkey

// If the left side of root is a number, then the right side
//   should be equal to that number.
if (typeof root.left === 'number') {
  nextMonkey = root.right as HumanDerivedMonkey
  nextMonkey!.shouldEqual = root.left
} else {
  nextMonkey = root.left as HumanDerivedMonkey
  nextMonkey!.shouldEqual = root.right as number
}

// Traverse down the derivation tree
while (nextMonkey) {
  const self = nextMonkey.shouldEqual!

  // If the left side is a constant...
  if (typeof nextMonkey.left === 'number') {
    const left = nextMonkey.left
    let right = 0

    // Use the value that we should be and the left side
    //   to figure out what the right side should be.
    switch (nextMonkey.operator) {
      case '+': right = self - left; break
      case '-': right = -(self - left); break
      case '*': right = self / left; break
      case '/': right = left / self; break
    }

    if (typeof nextMonkey.right === 'object') {
      nextMonkey.right.shouldEqual = right
      nextMonkey = nextMonkey.right
    } else {
      console.log('human should be ' + right)
      nextMonkey = null
    }
  } else {
    const right = nextMonkey.right as number
    let left = 0

    // Use the value that we should be and the right side
    //   to figure out what the left side should be.
    switch (nextMonkey.operator) {
      case '+': left = self - right; break
      case '-': left = self + right; break
      case '*': left = self / right; break
      case '/': left = self * right; break
    }

    if (typeof nextMonkey.left === 'object') {
      nextMonkey.left.shouldEqual = left
      nextMonkey = nextMonkey.left
    } else {
      console.log('human should be ' + left)
      nextMonkey = null
    }
  }
}
