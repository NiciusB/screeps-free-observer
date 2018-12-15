const { ScreepsAPI } = require('screeps-api')
const fs = require('fs')
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

async function readMemorySegment () {
  await api.socket.connect({
    keepAlive: false, // Due to Error: WebSocket is not open: readyState 0 (CONNECTING)
    maxRetries: Infinity
  })
  config.shards.forEach(shard => {
    api.segment.get(config.segment, shard).then(memory => {
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
        console.error(`The segment does not have valid data, make sure that it's not being used elsewhere. The current data is: ${memory.data}`)
        process.exit()
      }

      processRequests(shard)
    }).catch(err => console.error(err))
  })
}

function processRequests (shard) {
  if (!api.socket.connected) return false // Socket died on us. Wait for reconnect

  shards[shard].data.requests = shards[shard].data.requests.filter(reqRoom => shards[shard].notYetPushedRooms[reqRoom] === undefined)
  shards[shard].data.requests.forEach(async reqRoom => {
    shards[shard].notYetPushedRooms[reqRoom] = true
    shards[shard].notYetPushedRooms[reqRoom] = await getRoomData(`room:${shard}/${reqRoom}`)
  })
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

function writeMemorySegment () {
  config.shards.forEach(shard => {
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
  })
}

console.log(`Screeps Free Observer started on segment ${config.segment}!`)
setInterval(readMemorySegment, 1000 / (rateLimits.memorySegmentRead / 60 / 60))
setInterval(writeMemorySegment, 1000 / (rateLimits.memorySegmentWrite / 60 / 60))
readMemorySegment()
