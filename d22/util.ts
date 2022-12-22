export type Instruction = 'R' | 'L' | number

export enum Direction {
  RIGHT = 0,
  DOWN,
  LEFT,
  UP
}

export function parseLine(line: string): null | string | Instruction[] {
  const parts = line.split('')
  if (parts.length === 0) {
    return null
  }

  if (parts[0] === ' ' || parts[0] === '.' || parts[0] === '#') {
    return parts.join('')
  }

  const directions = [] as Instruction[]
  // Put the numbers back together again
  let numberBuffer = ''

  for (const part of parts) {
    if (part === 'L' || part === 'R') {
      if (numberBuffer.length > 0) {
        directions.push(parseInt(numberBuffer))
        numberBuffer = ''
      }
      directions.push(part)
    } else {
      numberBuffer += part
    }
  }

  if (numberBuffer.length > 0) {
    directions.push(parseInt(numberBuffer))
  }

  return directions
}
