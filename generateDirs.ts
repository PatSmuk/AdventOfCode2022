import { mkdirSync, writeFileSync } from 'fs'

const INITIAL_CODE = `import { readInputFileLines } from '../../util'

function parseLine(line: string) {
  return line
}

const inputs = readInputFileLines(__dirname, parseLine)
console.log(inputs)
`

for (let i = 1; i <= 25; i++) {
  const dir = 'd' + i
  try {
    mkdirSync(dir)
  } catch (err) {}

  try {
    mkdirSync(`${dir}/p1`)
  } catch (err) {}

  try {
    mkdirSync(`${dir}/p2`)
  } catch (err) {}

  writeFileSync(`${dir}/input.txt`, '', { flag: 'a' })
  writeFileSync(`${dir}/p1/index.ts`, INITIAL_CODE, { flag: 'a' })
  writeFileSync(`${dir}/p2/index.ts`, INITIAL_CODE, { flag: 'a' })
}
