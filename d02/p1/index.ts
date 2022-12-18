import { readInputFileLines } from '../../util'

type Choice = 'rock' | 'paper' | 'scissors'

const INPUT_TO_CHOICE: {[letter: string]: Choice} = {
  'A': 'rock',
  'B': 'paper',
  'C': 'scissors',
  'X': 'rock',
  'Y': 'paper',
  'Z': 'scissors'
}

const WIN = 6
const LOSE = 0
const DRAW = 3
const ROCK = 1
const PAPER = 2
const SCISSORS = 3

function parseLine(line: string): [Choice, Choice] {
  return [INPUT_TO_CHOICE[line[0]], INPUT_TO_CHOICE[line[2]]]
}

const inputs = readInputFileLines(__dirname, parseLine)
let totalScore = 0

for (const [opponent, player] of inputs) {
  switch (opponent) {
    case 'rock': {
      switch (player) {
        case 'rock': {
          totalScore += DRAW + ROCK; break
        }
        case 'paper': {
          totalScore += WIN + PAPER; break
        }
        case 'scissors': {
          totalScore += LOSE + SCISSORS; break
        }
      }
      break
    }
    case 'paper': {
      switch (player) {
        case 'rock': {
          totalScore += LOSE + ROCK; break
        }
        case 'paper': {
          totalScore += DRAW + PAPER; break
        }
        case 'scissors': {
          totalScore += WIN + SCISSORS; break
        }
      }
      break
    }
    case 'scissors': {
      switch (player) {
        case 'rock': {
          totalScore += WIN + ROCK; break
        }
        case 'paper': {
          totalScore += LOSE + PAPER; break
        }
        case 'scissors': {
          totalScore += DRAW + SCISSORS; break
        }
      }
      break
    }
  }
}

console.log(totalScore)
