const { ScreepsAPI } = require('screeps-api')
const fs = require('fs')
require('events').EventEmitter.defaultMaxListeners = 500
var config = {}

try {
  config = JSON.parse(fs.readFileSync('./config.json'))
} catch (e) {
  console.error('Please create your config.json file')
  process.exit()
}

const api = new ScreepsAPI({
  token: config.token,
  protocol: 'https',
  hostname: 'screeps.com',
  port: 443,
  path: '/'
})
api.socket.connect({
  keepAlive: false, // Due to Error: WebSocket is not open: readyState 0 (CONNECTING)
  maxRetries: Infinity
})

const rateLimits = {
  memorySegmentRead: 360, // Per hour
  memorySegmentWrite: 60 // Per hour
}

const shards = {}
config.shards.forEach(shard => {
  shards[shard] = {
    data: {},
    notYetPushedRooms: {}
  }
})
var writeAfterNextRead = false

async function readMemorySegment (shard, doWrite) {
  const memory = await api.segment.get(config.segment, shard)
  if (!memory.ok) console.error(JSON.stringify(memory))
  if (memory.data === null || memory.data === '') {
    console.log(`Welcome! Make sure to use the in-game API to request room data`)
    api.segment.set(config.segment, JSON.stringify({
      lastUpdated: 0,
      requests: [],
      responses: {}
    }), shard)
    return null
  }
  try {
    shards[shard].data = JSON.parse(memory.data)
    if (typeof shards[shard].data !== 'object' || !Array.isArray(shards[shard].data.requests)) throw new Error('') // Fire catch block
  } catch (e) {
    console.error(`The segment on ${shard} does not have valid data, make sure that it's not being used elsewhere. The current data is: ${memory.data}`)
    process.exit()
  }

  await processRequests(shard)
  if (doWrite) writeMemorySegment(shard)
}

async function processRequests (shard) {
  if (!api.socket.connected) return false // Socket died on us. Wait for reconnect

  shards[shard].data.requests = shards[shard].data.requests.filter(reqRoom => shards[shard].notYetPushedRooms[reqRoom] === undefined)
  const toAwait = []
  shards[shard].data.requests.forEach(reqRoom => {
    shards[shard].notYetPushedRooms[reqRoom] = true
    toAwait.push(getRoomData(`room:${shard}/${reqRoom}`).then(result => {
      shards[shard].notYetPushedRooms[reqRoom] = result
    }))
  })
  await Promise.all(toAwait)
}

function getRoomData (path) {
  return new Promise(resolve => {
    api.socket.subscribe(path, event => {
      if (!event || !event.data) return false
      api.socket.unsubscribe(path)
      event.data.lastUpdated = Date.now() / 1000
      resolve(event.data)
    })
  })
}

function writeMemorySegment (shard) {
  var changed = false
  for (let roomID in shards[shard].notYetPushedRooms) {
    if (shards[shard].notYetPushedRooms[roomID] === true) continue
    changed = true
    shards[shard].data.responses[roomID] = shards[shard].notYetPushedRooms[roomID]
    delete shards[shard].notYetPushedRooms[roomID]
    const indexToRemove = shards[shard].data.requests.indexOf(roomID)
    if (indexToRemove !== -1) shards[shard].data.requests.splice(indexToRemove, 1)
  }
  if (!changed) return false // Nothing to push
  shards[shard].data.lastUpdated = Date.now() / 1000
  api.segment.set(config.segment, JSON.stringify(shards[shard].data), shard)
}

function doReads () {
  config.shards.forEach(shard => {
    readMemorySegment(shard, writeAfterNextRead)
  })
  writeAfterNextRead = false
}

const readsPerSec = (rateLimits.memorySegmentRead / 60 / 60) / config.shards.length * 0.95 // 0.95 is just margin for errors
const writesPerSec = (rateLimits.memorySegmentWrite / 60 / 60) / config.shards.length * 0.95 // 0.95 is just margin for errors
setInterval(doReads, 1000 / readsPerSec)
setInterval(() => {
  writeAfterNextRead = true
}, 1000 / writesPerSec)

console.log(`Screeps Free Observer started on segment ${config.segment}!`)
doReads()
