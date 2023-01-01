import { BroadcastChannel, Worker, isMainThread, workerData, receiveMessageOnPort, parentPort } from 'worker_threads'
import { readInputFileLines } from '../../util'
import { parseLine } from '../util'

const STARTING_VALVE = 'AA'
const MAX_MINUTE = 30

const OPEN_CURRENT_VALVE = Symbol('open current valve')
type Choice = string | typeof OPEN_CURRENT_VALVE

interface State {
  minsPassed: number

  myCurrentValve: string

  openValves: string[]
  openValvesTotalFlow: number
  pressureRelieved: number

  myChoice: Choice
}

let valveFlowRates: {[valve: string]: number} = {}
let valveNeighbours: {[valve: string]: string[]} = {}
let distanceToValve: {[startValve: string]: {[endValve: string]: number}} = {}
let valvePriority = [] as string[]

// calculateMinTimeToReachNextValve is *very* expensive, so cache its results.
const calculateMinTimeToReachNextValveCache = new Map<string, number[]>()
// How deep into the valve-to-valve graph we want to go.
// Higher values = more time spent in calculateMinTimeToReachNextValve, more memory used, more accurate results.
const MAX_STEPS = 4

/** Calculates minimum time it will take to reach 1st, 2nd, 3rd, etc. valves from `startingValve` if `openValves` are already open. */
function calculateMinTimeToReachNextValve(startingValve: string, openValves: string[]): number[] {
  // Check cache first.
  const key = `${startingValve}/${openValves.join(',')}`
  const cachedResult = calculateMinTimeToReachNextValveCache.get(key)
  if (cachedResult) {
    return cachedResult
  }

  const totalTime = [] as number[]
  const closedValves = valvePriority.filter(v => !openValves.includes(v))
  let startPointsForNextStep = [[startingValve, 0, closedValves]] as [string, number, string[]][]

  // Take the smaller of the number of closed valves and the maximum depth allowed.
  const steps = Math.min(closedValves.length, MAX_STEPS)

  for (let step = 0; step < steps; step++) {
    const choices = [] as [string, number, string[]][]
    let minNewTime = Number.POSITIVE_INFINITY

    for (const [currentValve, currentTime, remainingValves] of startPointsForNextStep) {
      for (const newValve of remainingValves) {
        const newTime = newValve === currentValve ? 0 : currentTime + distanceToValve[currentValve][newValve]
        if (newTime > MAX_MINUTE) {
          continue
        }
        if (newTime < minNewTime) {
          minNewTime = newTime
        }

        const newRemainingValves = remainingValves.filter(v => v !== newValve)
        choices.push([newValve, newTime, newRemainingValves])
      }
    }

    totalTime.push(minNewTime)
    startPointsForNextStep = choices
  }

  const results = [totalTime[0]]
  for (let i = 1; i < totalTime.length; i++) {
    if (Number.isFinite(totalTime[i - 1])) {
      results[i] = totalTime[i] - totalTime[i - 1]
    } else {
      results[i] = Number.POSITIVE_INFINITY
    }
  }

  // Fill any missing entries with 1.
  while (results.length < closedValves.length) {
    results.push(1)
  }

  // Update cache.
  calculateMinTimeToReachNextValveCache.set(key, results)

  return results
}

// calculatePressureReliefUpperBound is also expensive, so cache it too.
const calculatePressureReliefUpperBoundCache = new Map<string, number[]>()

/**
 * Calculates a value >= the actual maximum pressure relief we get reach from `state`.
 *
 * It does this by assuming an ideal path between valves, i.e. the distance is the
 * minimum possible distance and the valve we reach is the best possible valve.
*/
function calculatePressureReliefUpperBound(state: State): number {
  // Check cache.
  const key = `${state.myCurrentValve}/${state.openValves.join(',')}`
  let pressureRelievedByMinute = calculatePressureReliefUpperBoundCache.get(key)
  if (pressureRelievedByMinute) {
    return state.pressureRelieved + pressureRelievedByMinute[MAX_MINUTE - state.minsPassed - 1]
  }

  pressureRelievedByMinute = []

  const closedValves = valvePriority.filter(v => !state.openValves.includes(v))
  const myMinsToNextValve = calculateMinTimeToReachNextValve(state.myCurrentValve, state.openValves)

  let minute = 0
  let pressureRelieved = 0
  let openValvesTotalFlow = state.openValvesTotalFlow
  let myValvesReached = 0
  let myMinsToValve = myMinsToNextValve[myValvesReached++]

  // While there are valves to close and time remaining...
  while (closedValves.length > 0 && minute < MAX_MINUTE) {
    minute++
    pressureRelieved += openValvesTotalFlow
    pressureRelievedByMinute.push(pressureRelieved)

    if (myMinsToValve > 0) {
      myMinsToValve--
    } else {
      const openedValve = closedValves.shift()!
      openValvesTotalFlow += valveFlowRates[openedValve]
      myMinsToValve = myMinsToNextValve[myValvesReached++]
    }
  }

  // If there's any time remaining...
  while (minute < MAX_MINUTE) {
    minute++
    pressureRelieved += openValvesTotalFlow
    pressureRelievedByMinute.push(pressureRelieved)
  }

  calculatePressureReliefUpperBoundCache.set(key, pressureRelievedByMinute)
  return state.pressureRelieved + pressureRelievedByMinute[MAX_MINUTE - state.minsPassed - 1]
}

// Channel for workers to send back their results.
const channel = new BroadcastChannel('maxFoundPressureRelief')

if (isMainThread) {
  const statesToVisit = [] as State[]
  const inputs = readInputFileLines(__dirname, parseLine)

  for (const { valve, flowRate, neighbours } of inputs) {
    valveFlowRates[valve] = flowRate
    valveNeighbours[valve] = neighbours

    if (flowRate > 0) {
      valvePriority.push(valve)
    }

    if (valve === STARTING_VALVE) {
      if (flowRate !== 0) {
        statesToVisit.push({
          minsPassed: 0,
          myCurrentValve: valve,
          openValves: [],
          openValvesTotalFlow: 0,
          pressureRelieved: 0,
          myChoice: OPEN_CURRENT_VALVE,
        })
      }
      for (let i = 0; i < neighbours.length; i++) {
        statesToVisit.push({
          minsPassed: 0,
          myCurrentValve: valve,
          openValves: [],
          openValvesTotalFlow: 0,
          pressureRelieved: 0,
          myChoice: neighbours[i],
        })
      }
    }
  }

  // Sort valves by flow rate.
  valvePriority.sort((a, b) => valveFlowRates[b] - valveFlowRates[a])

  // Compute distance from every valve to every other valve.
  for (const valve of Object.keys(valveNeighbours)) {
    const distanceToOthers: {[endValve: string]: number} = {}

    let distance = 1
    let neighboursAtNextDistance = new Set(valveNeighbours[valve])
    while (neighboursAtNextDistance.size > 0) {
      const neighboursAtCurrentDistance = neighboursAtNextDistance
      neighboursAtNextDistance = new Set()

      for (const neighbour of neighboursAtCurrentDistance) {
        distanceToOthers[neighbour] = distance

        for (const neighbourOfNeighbour of valveNeighbours[neighbour]) {
          if (neighbourOfNeighbour !== valve && distanceToOthers[neighbourOfNeighbour] === undefined) {
            neighboursAtNextDistance.add(neighbourOfNeighbour)
          }
        }
      }
      distance++
    }

    distanceToValve[valve] = distanceToOthers
  }

  // Keep track of the max pressure relief any worker has sent back.
  let maxFoundPressureRelief = 0
  channel.onmessage = (message: unknown) => {
    const result = (message as any).data as number
    if (result > maxFoundPressureRelief) {
      console.log(result)
      maxFoundPressureRelief = result

      for (const worker of workers) {
        worker.postMessage(result)
      }
    }
  }

  const workers = [] as Worker[]

  // Spawn a worker for every initial state.
  for (const state of statesToVisit) {
    const workerData = {
      state,
      valveFlowRates,
      valveNeighbours,
      valvePriority,
      distanceToValve
    }
    const worker = new Worker(__filename, { workerData })
    workers.push(worker)

    worker.on('exit', () => {
      // Remove this worker from workers.
      const index = workers.indexOf(worker)
      workers.splice(index, 1)

      // When every worker is done, we have our final answer.
      if (workers.length === 0) {
        console.log('final answer: ' + maxFoundPressureRelief)
        process.exit()
      }
    })
  }
} else {
  // Receive input-derived data from parent.
  valveFlowRates = workerData.valveFlowRates
  valveNeighbours = workerData.valveNeighbours
  valvePriority = workerData.valvePriority
  distanceToValve = workerData.distanceToValve

  const statesToVisit = [workerData.state] as State[]
  let maxFoundPressureRelief = 0
  let counter = 0

  while (statesToVisit.length > 0) {
    const state = statesToVisit.pop()!

    // Every 10,000 steps, check whether another worker has found a higher maximum than us.
    counter++
    if (counter % 10000) {
      let received = receiveMessageOnPort(parentPort!)
      while (received) {
        const pressureRelief = received.message as number
        maxFoundPressureRelief = Math.max(pressureRelief, maxFoundPressureRelief)
        received = receiveMessageOnPort(parentPort!)
      }
    }

    // Check whether this state will lead nowhere.
    const maxTheoreticalPressureRelief = calculatePressureReliefUpperBound(state)
    if (maxTheoreticalPressureRelief <= maxFoundPressureRelief) {
      continue
    }

    // Update pressure relieved and minute.
    state.pressureRelieved += state.openValvesTotalFlow
    state.minsPassed++

    // If we've run out of time, check whether we beat the previous record.
    if (state.minsPassed === MAX_MINUTE) {
      if (state.pressureRelieved > maxFoundPressureRelief) {
        maxFoundPressureRelief = state.pressureRelieved
        channel.postMessage(maxFoundPressureRelief)
      }
      continue
    }

    // Do our choice from previous round.
    if (state.myChoice === OPEN_CURRENT_VALVE) {
      state.openValves = [...state.openValves, state.myCurrentValve]
      state.openValves.sort()
      state.openValvesTotalFlow += valveFlowRates[state.myCurrentValve]
    } else {
      state.myCurrentValve = state.myChoice
    }

    const myChoices = [] as Choice[]
    const neighbours = valveNeighbours[state.myCurrentValve]
    const closedValves = valvePriority.filter(v => v !== state.myCurrentValve && !state.openValves.includes(v))

    // If there are still valves left to open...
    if (closedValves.length > 0) {
      const distanceToClosedValves = closedValves.map(v => distanceToValve[state.myCurrentValve][v])

      for (const neighbour of neighbours) {
        // If visiting this neighbour gets us closer to any of the closed valves,
        //   consider it as a possible choice.
        const neighbourDistances = distanceToValve[neighbour]
        if (distanceToClosedValves.some((d, i) => closedValves[i] === neighbour || d > neighbourDistances[closedValves[i]])) {
          myChoices.push(neighbour)
        }
      }
    }

    // If our current valve is not already open, maybe open it.
    if (!state.openValves.includes(state.myCurrentValve) && valveFlowRates[state.myCurrentValve] > 0) {
      myChoices.push(OPEN_CURRENT_VALVE)
    }

    // If both of us are out of things to do, stop here.
    if (myChoices.length === 0) {
      // Add pressure relief for any time remaining.
      state.pressureRelieved += (MAX_MINUTE - state.minsPassed) * state.openValvesTotalFlow

      // Check for new record.
      if (state.pressureRelieved > maxFoundPressureRelief) {
        maxFoundPressureRelief = state.pressureRelieved
        channel.postMessage(maxFoundPressureRelief)
      }

      continue
    }

    // For each of our choices...
    for (const myChoice of myChoices) {
      statesToVisit.push({
        ...state,
        myChoice
      })
    }
  }

  // End worker process.
  process.exit()
}
