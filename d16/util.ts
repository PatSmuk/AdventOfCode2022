import assert from 'assert'

const INPUT_PATTERN = /Valve ([A-Z]{2}) has flow rate=(\d+); tunnels? leads? to valves? ([A-Z, ]+)/

export function parseLine(line: string) {
  const match = INPUT_PATTERN.exec(line)
  assert(match)
  const [_, valve, flowRate, neighbours] = match
  return {
    valve,
    flowRate: parseInt(flowRate),
    neighbours: neighbours.split(', ')
  }
}
