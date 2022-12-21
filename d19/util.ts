export interface Blueprint {
  id: number

  oreBotOre: number
  clayBotOre: number
  obsidianBotOre: number
  obsidianBotClay: number
  geodeBotOre: number
  geodeBotObsidian: number
}

export interface State {
  minsPassed: number

  ore: number
  clay: number
  obsidian: number
  geodes: number

  oreBots: number
  clayBots: number
  obsidianBots: number
  geodeBots: number

  newBot: null | 'ore' | 'clay' | 'obsidian' | 'geode'
}

// Max theoretical amount of resources you can produce for a given number of
//   starting bots and a given number of minutes left
//   e.g. MAX_PRODUCTION[0][20] is the maximum amount of resources you can
//   generate if you start with 0 bots and have 20 minutes remaining.
const MAX_PRODUCTION: number[][] = []

function initMaxProductionTable(maxMinutes: number) {
  for (let startBots = 0; startBots < maxMinutes; startBots++) {
    MAX_PRODUCTION.push([startBots])

    for (let timeLeft = 1; timeLeft <= maxMinutes; timeLeft++) {
      // Amount of resources for next minute is equal to the amount of resources
      //   we had in the previous minute, plus 1 for each starting bot, plus
      //   1 for each minute that has passed, since a new bot can (theoretically)
      //   be added every minute.
      MAX_PRODUCTION[startBots].push(MAX_PRODUCTION[startBots][timeLeft-1]! + (startBots + timeLeft))
    }
  }
}

/** Calculates the upper bound on the maximum amount of geodes possible, given the current state */
function calculateMaxTheoreticalGeodes(maxMinutes: number, blueprint: Blueprint, state: State): number {
  const { clayBotOre, obsidianBotClay, geodeBotObsidian } = blueprint
  const { minsPassed, ore, clay, obsidian, geodes, oreBots, clayBots, obsidianBots, geodeBots } = state

  // First figure out how many mins it will be until clay bots being produced.
  let minsToClayBots = 0
  // If there are already clay bots, skip this step.
  if (clayBots === 0) {
    let addedOre = 0
    // Until we have enough ore to produce the first clay bot...
    while (ore + addedOre < clayBotOre) {
      // Do a single time step and look up how much ore has been added,
      //   given the number of ore bots we already have.
      addedOre = MAX_PRODUCTION[oreBots][minsToClayBots]
      minsToClayBots++
    }
  }

  // Next do the same thing but for obsidian bots.
  let minsToObsidianBots = 0
  if (obsidianBots === 0) {
    let addedClay = 0
    // Don't care about ore here (assume we just magically have enough).
    while (clay + addedClay < obsidianBotClay) {
      addedClay = MAX_PRODUCTION[clayBots][minsToObsidianBots]
      minsToObsidianBots++
    }
  }

  // Finally do the same thing for geode bots.
  let minsToGeodeBots = 0
  if (geodeBots === 0) {
    let addedObsidian = 0
    while (obsidian + addedObsidian < geodeBotObsidian) {
      addedObsidian = MAX_PRODUCTION[obsidianBots][minsToGeodeBots]
      minsToGeodeBots++
    }
  }

  // Now that we know how long it will be until we get the first geode bot
  //   produced (if there isn't one already), we can figure out what the most
  //   resources we could produce beyond that point would be, until time runs out.
  return geodes + MAX_PRODUCTION[geodeBots][maxMinutes - minsPassed - minsToGeodeBots - minsToObsidianBots - minsToClayBots]
}

export function calculateMaxGeodes(maxMinutes: number, blueprint: Blueprint): number {
  initMaxProductionTable(maxMinutes)

  const { oreBotOre, clayBotOre, obsidianBotOre, obsidianBotClay, geodeBotOre, geodeBotObsidian } = blueprint
  let maxGeodes = 0

  // Initial state is 1 ore bot, no other bots, no resources.
  const states: State[] = [{
    minsPassed: 0,
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

  // While there are still viable states to consider...
  while (states.length > 0) {
    // Get the deepest state.
    // This keeps the amount of states from getting completely out of control.
    const state = states[states.length - 1]

    // Update resource counters.
    state.ore += state.oreBots
    state.clay += state.clayBots
    state.obsidian += state.obsidianBots
    state.geodes += state.geodeBots

    // Spawn whichever new bot we're supposed to spawn (if any).
    switch (state.newBot) {
      case 'ore': state.oreBots++; break
      case 'clay': state.clayBots++; break
      case 'obsidian': state.obsidianBots++; break
      case 'geode': state.geodeBots++; break
    }
    state.newBot = null

    // Increment time.
    state.minsPassed++

    // Figure out how many geodes we could theoretically still produce from this point.
    const maxTheoreticalGeodes = calculateMaxTheoreticalGeodes(maxMinutes, blueprint, state)
    // If we can't beat max geodes from here, give up early.
    if (maxTheoreticalGeodes <= maxGeodes) {
      states.pop()
      continue
    }

    // If we're reached the end, stop.
    if (state.minsPassed === maxMinutes) {
      states.pop()
      maxGeodes = Math.max(maxGeodes, state.geodes)
      continue
    }

    // For each type of bot, figure out if we can spawn it.
    // If we can, push a branch where we do so.
    if (state.ore >= oreBotOre) {
      states.push({
        minsPassed: state.minsPassed,
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
        minsPassed: state.minsPassed,
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
        minsPassed: state.minsPassed,
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
        minsPassed: state.minsPassed,
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

  return maxGeodes
}

export function parseLine(line: string): Blueprint {
  // "Blueprint A: Each ore robot costs B ore. Each clay robot costs C ore. Each obsidian robot costs D ore and E clay. Each geode robot costs F ore and G obsidian."
  const parts = line.split(' ')

  //              1                                 6                                        12                                           18              21                                         27              30
  // ["Blueprint","A:","Each","ore","robot","costs","B","ore.","Each","clay","robot","costs","C","ore.","Each","obsidian","robot","costs","D","ore","and","E","clay.","Each","geode","robot","costs","F","ore","and","G","obsidian."]
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
