import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { readInputFileLines } from '../../util'

interface Blueprint {
  id: number

  oreBotOre: number
  clayBotOre: number
  obsidianBotOre: number
  obsidianBotClay: number
  geodeBotOre: number
  geodeBotObsidian: number
}

type BotType = 'ore' | 'clay' | 'obsidian' | 'geode'

interface State {
  minute: number

  ore: number
  clay: number
  obsidian: number
  geodes: number

  oreBots: number
  clayBots: number
  obsidianBots: number
  geodeBots: number

  newBot: null | BotType
}

const MAX_MINUTES = 24

function calculateMaxGeodes({ id, oreBotOre, clayBotOre, obsidianBotOre, obsidianBotClay, geodeBotOre, geodeBotObsidian }: Blueprint): number {
  let maxGeodes = 0
  let statesConsidered = 0

  const maxGeodeBotsPerMinute = new Map<number, number>()
  const maxObsidianBotsPerMinute = new Map<number, number>()

  for (let i = 1; i <= MAX_MINUTES; i++) {
    maxGeodeBotsPerMinute.set(i, 0)
    maxObsidianBotsPerMinute.set(i, 0)
  }

  const states: State[] = [{
    minute: 0,
    ore: 0,
    clay: 0,
    obsidian: 0,
    geodes: 0,
    oreBots: 1,
    clayBots: 0,
    obsidianBots: 0,
    geodeBots: 0,
    newBot: null
  }]

  while (states.length > 0) {
    statesConsidered++
    const state = states[states.length - 1]
    state.minute++

    state.ore += state.oreBots
    state.clay += state.clayBots
    state.obsidian += state.obsidianBots
    state.geodes += state.geodeBots

    switch (state.newBot) {
      case 'ore': state.oreBots++; break
      case 'clay': state.clayBots++; break
      case 'obsidian': state.obsidianBots++; break
      case 'geode': state.geodeBots++; break
    }
    state.newBot = null

    const maxGeodeBots = maxGeodeBotsPerMinute.get(state.minute)!
    // If there is another state that has more geode bots by this point, give up here
    if (state.geodeBots < maxGeodeBots) {
      states.pop()
      continue
    }

    // Do we have more geode bots than any other state?
    if (state.geodeBots !== maxGeodeBots) {
      maxGeodeBotsPerMinute.set(state.minute, state.geodeBots)
    }

    if (state.minute === MAX_MINUTES) {
      states.pop()
      maxGeodes = Math.max(maxGeodes, state.geodes)
      continue
    }

    if (state.ore >= oreBotOre) {
      states.push({
        minute: state.minute,
        ore: state.ore - oreBotOre,
        clay: state.clay,
        obsidian: state.obsidian,
        geodes: state.geodes,
        oreBots: state.oreBots,
        clayBots: state.clayBots,
        obsidianBots: state.obsidianBots,
        geodeBots: state.geodeBots,
        newBot: 'ore'
      })
    }
    if (state.ore >= clayBotOre) {
      states.push({
        minute: state.minute,
        ore: state.ore - clayBotOre,
        clay: state.clay,
        obsidian: state.obsidian,
        geodes: state.geodes,
        oreBots: state.oreBots,
        clayBots: state.clayBots,
        obsidianBots: state.obsidianBots,
        geodeBots: state.geodeBots,
        newBot: 'clay'
      })
    }
    if (state.ore >= obsidianBotOre && state.clay >= obsidianBotClay) {
      states.push({
        minute: state.minute,
        ore: state.ore - obsidianBotOre,
        clay: state.clay - obsidianBotClay,
        obsidian: state.obsidian,
        geodes: state.geodes,
        oreBots: state.oreBots,
        clayBots: state.clayBots,
        obsidianBots: state.obsidianBots,
        geodeBots: state.geodeBots,
        newBot: 'obsidian'
      })
    }
    if (state.ore >= geodeBotOre && state.obsidian >= geodeBotObsidian) {
      states.push({
        minute: state.minute,
        ore: state.ore - geodeBotOre,
        clay: state.clay,
        obsidian: state.obsidian - geodeBotObsidian,
        geodes: state.geodes,
        oreBots: state.oreBots,
        clayBots: state.clayBots,
        obsidianBots: state.obsidianBots,
        geodeBots: state.geodeBots,
        newBot: 'geode'
      })
    }
  }

  console.log(id, maxGeodes, statesConsidered)
  return maxGeodes
}

function parseLine(line: string): Blueprint {
  const parts = line.split(' ')

  const nums = [
    parts[1], parts[6], parts[12], parts[18], parts[21], parts[27], parts[30]
  ].map(x => parseInt(x)) as [number, number, number, number, number, number, number]

  return {
    id: nums[0],
    oreBotOre: nums[1],
    clayBotOre: nums[2],
    obsidianBotOre: nums[3],
    obsidianBotClay: nums[4],
    geodeBotOre: nums[5],
    geodeBotObsidian: nums[6]
  }
}

if (isMainThread) {
  const blueprints = readInputFileLines(__dirname, parseLine)
  const qualityLevels = [] as number[]
  let numThreadsActive = 0

  function spawnThread(blueprint: Blueprint) {
    numThreadsActive++

    const worker = new Worker(__filename, { workerData: blueprint })

    worker.on('message', (maxGeodes) => {
      qualityLevels.push(maxGeodes * blueprint.id)
    })

    worker.on('error', (err) => {
      console.error('worker error: ' + err.message + '\n' + err.stack)
    })

    worker.on('exit', () => {
      numThreadsActive--

      const blueprint = blueprints.pop()
      if (blueprint) {
        spawnThread(blueprint)
      } else if (numThreadsActive === 0) {
        console.log(qualityLevels.reduce((prev, curr) => prev + curr, 0))
      }
    })
  }

  for (let i = 0; i < 16; i++) {
    const blueprint = blueprints.pop()
    if (!blueprint) {
      break
    }

    spawnThread(blueprint)
  }
} else {
  const maxGeodes = calculateMaxGeodes(workerData)
  parentPort!.postMessage(maxGeodes)
}
