import { readInputFileLines, mapInc } from '../../util'

function parseLine(line: string) {
  return line.split(',').map(x => parseInt(x))
}

const cubes = readInputFileLines(__dirname, parseLine)
const faces = new Set<string>()

function addFace(x: number, y: number, z: number) {
  const key = `${x},${y},${z}`

  // If the face is already here then it is between this
  //   cube and the neighbour, so remove it.
  if (faces.has(key)) {
    faces.delete(key)
  } else {
    faces.add(key)
  }
}

for (const [x, y, z] of cubes) {
  addFace(x - 0.5, y, z)
  addFace(x + 0.5, y, z)
  addFace(x, y - 0.5, z)
  addFace(x, y + 0.5, z)
  addFace(x, y, z - 0.5)
  addFace(x, y, z + 0.5)
}

console.log(faces.size)
