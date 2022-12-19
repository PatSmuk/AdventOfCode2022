import { readInputFileLines } from '../../util'

function parseLine(line: string): string {
  return line
}

function fromKey(key: string): [number, number, number] {
  const parts = key.split(',')
  return [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])]
}

function toKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`
}

const cubes = new Set<string>(readInputFileLines(__dirname, parseLine))
const faces = new Set<string>()

function addFace(x: number, y: number, z: number) {
  const key = toKey(x, y, z)

  // If the face is already here then it is between this
  //   cube and the neighbour, so remove it.
  if (faces.has(key)) {
    faces.delete(key)
  } else {
    faces.add(key)
  }
}

for (const cube of cubes) {
  const [x, y, z] = fromKey(cube)
  addFace(x - 0.5, y, z)
  addFace(x + 0.5, y, z)
  addFace(x, y - 0.5, z)
  addFace(x, y + 0.5, z)
  addFace(x, y, z - 0.5)
  addFace(x, y, z + 0.5)
}

// Min bound should be 1 less than min in actual data
const MIN_BOUND = -1
// Max bound should be 1 more than max in actual data
const MAX_BOUND = 20

// Start the flood fill just outside the bounds, so it's
//   guaranteed to not be a cube.
const OUTSIDE_START_POINT = `${MIN_BOUND},${MIN_BOUND},${MIN_BOUND}`

const DIRECTIONS: [number, number, number][] = [
  [-1, 0, 0],
  [+1, 0, 0],
  [0, -1, 0],
  [0, +1, 0],
  [0, 0, -1],
  [0, 0, +1]
]

const externalFaces = new Set<string>()
// Keep track of every outside space that has been considered
const outsideSpacesSeen = new Set<string>([OUTSIDE_START_POINT])
// List of all outside spaces that still need to be operated on
const outsideSpacesToVisit = new Set<string>([OUTSIDE_START_POINT])

// Do a 3D flood fill of all the outside space to tag all external faces
while (outsideSpacesToVisit.size > 0) {
  for (const space of outsideSpacesToVisit) {
    // Only check each space once
    outsideSpacesToVisit.delete(space)

    const [ox, oy, oz] = fromKey(space)

    for (const [dx, dy, dz] of DIRECTIONS) {
      // Check the face in this direction to see if is in the list of faces
      {
        const x = ox + dx * 0.5
        const y = oy + dy * 0.5
        const z = oz + dz * 0.5
        const key = toKey(x, y, z)

        // If it is, then it is an external face
        if (faces.has(key)) {
          externalFaces.add(key)
        }
      }
      // Check the next space in this direction
      {
        const x = ox + dx
        const y = oy + dy
        const z = oz + dz

        // Bounds check
        if (x < MIN_BOUND || x > MAX_BOUND || y < MIN_BOUND || y > MAX_BOUND || z < MIN_BOUND || z > MAX_BOUND) {
          continue
        }

        const key = toKey(x, y, z)

        // If the space is not a cube and hasn't already been looked at,
        //   then it should be visited later
        if (!outsideSpacesSeen.has(key) && !cubes.has(key)) {
          outsideSpacesSeen.add(key)
          outsideSpacesToVisit.add(key)
        }
      }
    }
  }
}

console.log(externalFaces.size)
