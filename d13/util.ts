export type List = List[] | number

export enum Result {
  IN_ORDER = -1,
  UNKNOWN,
  OUT_OF_ORDER
}

export function compareList(left: List, right: List): Result {
  if (typeof left === 'number') {
    // Handle both integers.
    if (typeof right === 'number') {
      if (left < right) {
        return Result.IN_ORDER
      }

      if (left > right) {
        return Result.OUT_OF_ORDER
      }

      return Result.UNKNOWN
    }

    // Not both integers, wrap left.
    left = [left]
  }

  // Not both integers, wrap right.
  if (typeof right === 'number') {
    right = [right]
  }

  for (let i = 0; true; i++) {
    // Check if left side ran out.
    if (i === left.length) {
      // If right side has more, in order.
      if (i !== right.length) {
        return Result.IN_ORDER
      }
      // Same length.
      return Result.UNKNOWN
    }

    // Left side has more, not in order.
    if (i === right.length) {
      return Result.OUT_OF_ORDER
    }

    // Compare each element.
    const result = compareList(left[i], right[i])
    // If we get a non-unknown result, return it.
    if (result !== Result.UNKNOWN) {
      return result
    }
  }
}

export function parseLine(line: string): List | null {
  if (line.length === 0) {
    return null
  }
  return JSON.parse(line) as List
}
