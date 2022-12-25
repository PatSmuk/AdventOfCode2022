import { readInputFileLines } from '../../util'

const FROM_SNAFU_CHAR: {[char: string]: number} = {
  '0': 0,
  '1': 1,
  '2': 2,
  '-': -1,
  '=': -2
}
const TO_SNAFU_CHAR: {[char: string]: string} = {
  '-1': '-',
  '-2': '=',
  '0': '0',
  '1': '1',
  '2': '2'
}

function fromSnafu(snafu: string): number {
  let n = 0
  for (let i = 0; i < snafu.length; i++) {
    n *= 5
    n += FROM_SNAFU_CHAR[snafu[i]]
  }
  return n
}

function toSnafu(n: number): string {
  const baseFive = n.toString(5).split('').map(x => parseInt(x))
  // Add a 0 to the front in case we need to carry into it.
  baseFive.unshift(0)

  let snafu = ''
  for (let i = baseFive.length - 1; i >= 0; i--) {
    const digit = baseFive[i]
    // If digit is valid SNAFU, add it to the string.
    if (digit <= 2) {
      snafu = digit + snafu
    } else {
      // Otherwise, carry a 5 to the next digit and set this one
      //   to the SNAFU char that represents the difference.
      baseFive[i - 1] = baseFive[i - 1] + 1
      snafu = TO_SNAFU_CHAR[(digit - 5).toString()] + snafu
    }
  }

  // Remove leading "0".
  if (snafu[0] === '0') {
    return snafu.slice(1)
  }
  return snafu
}

function parseLine(line: string) {
  return fromSnafu(line)
}

const inputs = readInputFileLines(__dirname, parseLine)
const sum = inputs.reduce((curr, prev) => curr + prev, 0)
console.log(sum, toSnafu(sum))
