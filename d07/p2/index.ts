import assert from 'assert'
import { readInputFileLines } from '../../util'
import { Directory, isCommand, parseLine } from '../util'

const rootDirectory: Directory = {
  name: '/',
  type: 'dir',
  contents: {},
  parent: null,
  size: 0
}

const inputs = readInputFileLines(__dirname, parseLine)
let currentDirectory = rootDirectory

for (const line of inputs) {
  if (isCommand(line)) {
    const { command, arg } = line

    // Just ignore the "ls" command.
    if (command === 'ls') {
      continue
    }
    assert(arg)

    if (arg === '/') {
      currentDirectory = rootDirectory
    } else if (arg === '..') {
      assert(currentDirectory.parent)
      currentDirectory = currentDirectory.parent
    } else {
      assert(currentDirectory.contents[arg])
      assert(currentDirectory.contents[arg].type === 'dir')
      currentDirectory = currentDirectory.contents[arg] as Directory
    }

    continue
  }

  // Add file or directory to current directory.
  currentDirectory.contents[line.name] = line

  // If the line is a directory, give it a parent.
  if (line.type === 'dir') {
    line.parent = currentDirectory
  } else {
    // Otherwise, update every parent with the file's size.
    let parent = currentDirectory as Directory | null

    while (parent !== null) {
      parent.size += line.size
      assert(parent.size < Number.MAX_SAFE_INTEGER)
      parent = parent.parent
    }
  }
}

const MAX_DISK_SPACE = 70000000
const UNUSED_SPACE_REQUIRED = 30000000
const spaceTaken = MAX_DISK_SPACE - rootDirectory.size
const spaceNeeded = UNUSED_SPACE_REQUIRED - spaceTaken

// The best directory is the one with the tightest gap between its size and the space needed.
let bestDirectory = rootDirectory
let bestDirectoryDiff = rootDirectory.size - spaceNeeded

function visitDirectory(directory: Directory) {
  // Check if this directory has a tighter gap than the current best.
  const diff = directory.size - spaceNeeded
  if (diff < bestDirectoryDiff) {
    bestDirectory = directory
    bestDirectoryDiff = diff
  }

  // Visit each child directory that would give enough space if deleted.
  for (const fileOrDir of Object.values(directory.contents)) {
    if (fileOrDir.type === 'dir' && fileOrDir.size >= spaceNeeded) {
      visitDirectory(fileOrDir)
    }
  }
}

visitDirectory(rootDirectory)
console.log(bestDirectory.size)
