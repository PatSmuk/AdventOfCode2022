export interface CommandInput {
  command: string
  arg?: string
}
export interface Directory {
  name: string
  type: 'dir'
  contents: {[name: string]: FileOrDirectory}
  parent: Directory | null
  size: number
}
export interface File {
  name: string
  type: 'file'
  size: number
}
export type FileOrDirectory = File | Directory

export function isCommand(x: any): x is CommandInput {
  return x.command !== undefined
}

export function parseLine(line: string): CommandInput | FileOrDirectory {
  const parts = line.split(' ')
  if (parts[0] === '$') {
    return {
      command: parts[1],
      arg: parts[2]
    }
  }
  const size = parseInt(parts[0])
  if (isNaN(size)) {
    return {
      name: parts[1],
      type: 'dir',
      contents: {},
      parent: null,
      size: 0
    }
  }
  return {
    name: parts[1],
    type: 'file',
    size
  }
}
