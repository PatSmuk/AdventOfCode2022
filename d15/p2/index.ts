import assert from 'assert'
import { readInputFileLines } from '../../util'

// To run example, swap the comments here:
const MAX_COORD = 4000000
// const MAX_COORD = 20

const INPUT_PATTERN = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/

function parseLine(line: string) {
  const match = INPUT_PATTERN.exec(line)
  assert(match)
  const [sensorX, sensorY, beaconX, beaconY] = match.slice(1).map(x => parseInt(x))
  return { sensorX, sensorY, beaconX, beaconY }
}

const inputs = readInputFileLines(__dirname, parseLine)

// Remember every sensor's position and how far it can see.
const sensorRanges = [] as [number, number, number][]
for (const { sensorX, sensorY, beaconX, beaconY } of inputs) {
  const range = Math.abs(beaconX - sensorX) + Math.abs(beaconY - sensorY)
  sensorRanges.push([sensorX, sensorY, range])
}

// Check every (x,y) coordinate in range.
done: for (let x = 0; x < MAX_COORD; x++) {
  for (let y = 0; y < MAX_COORD; y++) {
    let isInSensorRange = false

    // Try to find a sensor in range of this coordinate.
    for (const [sensorX, sensorY, range] of sensorRanges) {
      const distToSensor = Math.abs(sensorX - x) + Math.abs(sensorY - y)
      if (distToSensor <= range) {
        isInSensorRange = true
        // Optimization: we can skip forward until we are out of range of this sensor on the next iteration.
        y += range - distToSensor
        break
      }
    }

    // No sensors in range, we found the gap.
    if (!isInSensorRange) {
      console.log(x, y, x * 4000000 + y)
      break done
    }
  }
}
