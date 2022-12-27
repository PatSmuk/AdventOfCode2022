import { readInputFileLines } from '../../util'
import { List, parseLine, compareList } from '../util'

const packets = readInputFileLines(__dirname, parseLine).filter(p => p !== null) as List[]
packets.push([[2]], [[6]])
packets.sort((a, b) => compareList(a, b))

const divider1Index = packets.findIndex(p => JSON.stringify(p) === '[[2]]') + 1
const divider2Index = packets.findIndex(p => JSON.stringify(p) === '[[6]]') + 1

console.log(divider1Index, divider2Index, divider1Index * divider2Index)
