import assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'

export function readInputFileLines<T>(dirname: string, parser: (line: string, i: number) => T): T[] {
    const data = fs.readFileSync(
      path.join(dirname, '..', 'input.txt'),
      { encoding: 'utf8' }
    ).split('\n')

    return data.map(parser)
}

/** Increments the value associated with `key` in `map` by `value`. */
export function mapInc<K>(map: Map<K, number>, key: K, value: number) {
  const existing = map.get(key)
  if (existing) {
    map.set(key, existing + value)
  } else {
    map.set(key, value)
  }
}

export interface AStarParams<K> {
  /** The node to start on. */
  start: K
  /** The node that we want to find the optimal path to. */
  isEnd: (key: K) => boolean
  /** A function that returns an estimate of the distance from `key` to the target node. */
  getDistance: (key: K) => number
  /** A function that returns the weighting of `key`. */
  getWeight: (key: K) => number
  /** A function that returns the neighbours of `key`. */
  getNeighbours: (key: K) => K[]
}

/** Generic implementation of A* search algorithm over a graph of nodes identified by values of type `K`. */
export function aStarSearch<K>({ start, isEnd, getDistance, getWeight, getNeighbours }: AStarParams<K>): K[] {
  let openSet: K[] = [start]
  const cameFrom = new Map<K, K>()
  const gScores = new Map<K, number>([[start, getWeight(start)]])
  const fScores = new Map([[start, getDistance(start)]])

  // While there are more nodes to visit...
  while (openSet.length > 0) {
    // Get element from openSet with lowest risk and closest distance.
    let current = openSet.reduce((prev, curr) => fScores.get(prev)! < fScores.get(curr)! ? prev : curr)

    // Remove current from the open set.
    openSet = openSet.filter(x => x != current)

    // If we made it to the end...
    if (isEnd(current)) {
      const totalPath = [current]

      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!
        totalPath.unshift(current)
      }

      return totalPath
    }

    const gScore = gScores.get(current)!
    for (const neighbour of getNeighbours(current)) {
      // Calculate what our risk would be if we were to visit neighbour from this node.
      const tentGScore = gScore + getWeight(neighbour)

      // If no one has visited neighbour yet or we have the lowest risk path...
      const neighbourGScore = gScores.get(neighbour)
      if (neighbourGScore === undefined || tentGScore < neighbourGScore) {
        // Set best path to neighbour to be from this node.
        cameFrom.set(neighbour, current)

        // Update neighbours risk and score.
        gScores.set(neighbour, tentGScore)
        fScores.set(neighbour, tentGScore + getDistance(neighbour))

        // If the neighbour is not in the set of nodes to visit, add it.
        if (!openSet.includes(neighbour)) {
          openSet.push(neighbour)
        }
      }
    }
  }

  return []
}

export class Coord {
  x: number
  y: number

  constructor(str: string)
  constructor(x: number, y: number)
  constructor(xOrString: number | string, y?: number) {
    if (typeof xOrString === 'number') {
      assert(y)
      this.x = xOrString
      this.y = y
    } else {
      const [l, r] = xOrString.split(',')
      this.x = parseInt(l)
      this.y = parseInt(r)
      assert(!isNaN(this.x))
      assert(!isNaN(this.y))
    }
  }

  toString(): string {
    return `${this.x},${this.y}`
  }

  add(coord: Coord): void
  add(dx: number, dy: number): void
  add(coordOrDx: Coord | number, dy?: number): void {
    if (typeof coordOrDx === 'number') {
      assert(dy)
      this.x += coordOrDx
      this.y += dy
    } else {
      this.x += coordOrDx.x
      this.y += coordOrDx.y
    }
  }
}
