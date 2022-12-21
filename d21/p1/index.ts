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

const inputs = readInputFileLines(__dirname, parseLine)
const resolvedMonkeys = new Map<string, number>()
const unresolvedMonkeys = new Set<DerivedMonkey>()

for (const monkey of inputs) {
  if (monkey.operator === 'const') {
    resolvedMonkeys.set(monkey.name, monkey.value)
  } else {
    unresolvedMonkeys.add(monkey)
  }
}

// While there are still unresolved monkeys...
while (unresolvedMonkeys.size > 0) {
  for (const monkey of unresolvedMonkeys) {
    const left = resolvedMonkeys.get(monkey.left)
    const right = resolvedMonkeys.get(monkey.right)

    // If left and right are now resolved
    if (left !== undefined && right !== undefined) {
      unresolvedMonkeys.delete(monkey)

      // Calculate value for this monkey
      let value = 0
      switch (monkey.operator) {
        case '+': value = left + right; break
        case '-': value = left - right; break
        case '*': value = left * right; break
        case '/': value = left / right; break
      }

      resolvedMonkeys.set(monkey.name, value)
    }
  }
}

// Print the resolved value of the root monkey
console.log(resolvedMonkeys.get('root'))
