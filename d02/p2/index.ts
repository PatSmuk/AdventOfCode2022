import { readInputFileLines } from '../../util'

type Choice = 'rock' | 'paper' | 'scissors'
type Outcome = 'win' | 'lose' | 'draw'

const INPUT_TO_CHOICE: {[letter: string]: Choice} = {
  'A': 'rock',
  'B': 'paper',
  'C': 'scissors'
}
const INPUT_TO_OUTCOME: {[letter: string]: Outcome} = {
  'X': 'lose',
  'Y': 'draw',
  'Z': 'win'
}

const WIN = 6
const LOSE = 0
const DRAW = 3
const ROCK = 1
const PAPER = 2
const SCISSORS = 3

function parseLine(line: string): [Choice, Outcome] {
  return [INPUT_TO_CHOICE[line[0]], INPUT_TO_OUTCOME[line[2]]]
}

const inputs = readInputFileLines(__dirname, parseLine)
let totalScore = 0

for (const [opponentChoice, outcome] of inputs) {
  switch (opponentChoice) {
    case 'rock': {
      switch (outcome) {
        case 'win': {
          totalScore += WIN + PAPER; break
        }
        case 'lose': {
          totalScore += LOSE + SCISSORS; break
        }
        case 'draw': {
          totalScore += DRAW + ROCK; break
        }
      }
      break
    }
    case 'paper': {
      switch (outcome) {
        case 'win': {
          totalScore += WIN + SCISSORS; break
        }
        case 'lose': {
          totalScore += LOSE + ROCK; break
        }
        case 'draw': {
          totalScore += DRAW + PAPER; break
        }
      }
      break
    }
    case 'scissors': {
      switch (outcome) {
        case 'win': {
          totalScore += WIN + ROCK; break
        }
        case 'lose': {
          totalScore += LOSE + PAPER; break
        }
        case 'draw': {
          totalScore += DRAW + SCISSORS; break
        }
      }
      break
    }
  }
}

console.log(totalScore)
