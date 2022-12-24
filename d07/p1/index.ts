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

// Sum up all the directories with size < MAX_SIZE.
const MAX_SIZE = 100000
let smallDirectoriesSum = 0

function visitDirectory(directory: Directory) {
  if (directory.size <= MAX_SIZE) {
    smallDirectoriesSum += directory.size
  }

  // Visit each child directory.
  for (const fileOrDir of Object.values(directory.contents)) {
    if (fileOrDir.type === 'dir') {
      visitDirectory(fileOrDir)
    }
  }
}

visitDirectory(rootDirectory)
console.log(smallDirectoriesSum)
