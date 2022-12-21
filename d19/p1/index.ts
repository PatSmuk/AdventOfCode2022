import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { readInputFileLines } from '../../util'
import { Blueprint, parseLine, calculateMaxGeodes } from '../util'

const MAX_MINUTES = 24
const MAX_WORKER_THREADS = 16

if (isMainThread) {
  /*
   * MAIN THREAD
   */
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
        console.log('answer: ' + qualityLevels.reduce((prev, curr) => prev + curr, 0))
      }
    })
  }

  for (let i = 0; i < MAX_WORKER_THREADS; i++) {
    const blueprint = blueprints.pop()
    if (!blueprint) {
      break
    }

    spawnThread(blueprint)
  }
} else {
  /*
   * WORKER THREAD
   */
  const startTime = Date.now()
  const maxGeodes = calculateMaxGeodes(MAX_MINUTES, workerData)
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(workerData.id, maxGeodes, elapsed)
  parentPort!.postMessage(maxGeodes)
}
