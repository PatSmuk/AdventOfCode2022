import assert from 'assert'
import { readInputFileLines } from '../../util'

// To run example, swap the comments here:
const TARGET_Y = 2000000
// const TARGET_Y = 10

const INPUT_PATTERN = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/

function parseLine(line: string) {
  const match = INPUT_PATTERN.exec(line)
  assert(match)
  const [sensorX, sensorY, beaconX, beaconY] = match.slice(1).map(x => parseInt(x))
  return { sensorX, sensorY, beaconX, beaconY }
}

// Track how many positions at TARGET_Y have no beacon.
const noBeaconPositions = new Set<number>()

const inputs = readInputFileLines(__dirname, parseLine)

const beaconPositions = new Set<string>()
const sensorPositions = new Set<string>()
for (const { sensorX, sensorY, beaconX, beaconY } of inputs) {
  beaconPositions.add(`${beaconX},${beaconY}`)
  sensorPositions.add(`${sensorX},${sensorY}`)
}

for (const { sensorX, sensorY, beaconX, beaconY } of inputs) {
  // Figure out the distance sensor to target Y.
  const sensorRange = Math.abs(beaconX - sensorX) + Math.abs(beaconY - sensorY)
  const distanceToTargetY = Math.abs(sensorY - TARGET_Y)
  const xRangeAtTargetY = sensorRange - distanceToTargetY

  // If target Y is beyond the range of the sensor, skip.
  if (xRangeAtTargetY < 0) {
    continue
  }

  for (let x = sensorX - xRangeAtTargetY; x <= sensorX + xRangeAtTargetY; x++) {
    // If there's no beacon at this position, at it to set of no beacon positions.
    if (!beaconPositions.has(`${x},${TARGET_Y}`)) {
      noBeaconPositions.add(x)
    }
  }
}

console.log(noBeaconPositions.size)
