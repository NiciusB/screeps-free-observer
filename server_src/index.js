const { ScreepsAPI } = require('screeps-api')
const fs = require('fs')
require('events').EventEmitter.defaultMaxListeners = 500
let config = {}

const cjson = require('compressed-json')

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
let writeAfterNextRead = false

function resetSegment (shard) {
  api.segment.set(config.segment, cjson.compress.toString({
    lastUpdated: 0,
    requests: [],
    responses: {}
  }), shard)
}

async function readMemorySegment (shard, doWrite) {
  const memory = await api.segment.get(config.segment, shard)
  if (!memory.ok) console.error(JSON.stringify(memory))
  if (memory.data === null || memory.data === '') {
    console.log('Welcome! Make sure to use the in-game API to request room data')
    resetSegment(shard)
    return null
  }
  try {
    shards[shard].data = cjson.decompress.fromString(memory.data)
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
      shards[shard].notYetPushedRooms[reqRoom] = { room: result, lastUpdated: Math.floor(Date.now() / 1000) }
    }))
  })
  await Promise.all(toAwait)
}

function getRoomData (path) {
  return new Promise(resolve => {
    api.socket.subscribe(path, event => {
      if (!event || !event.data) return false
      api.socket.unsubscribe(path)
      const controllers = Object.values(event.data.objects).filter(obj => obj.type === 'controller').map(controller => {
        return {
          x: controller.x,
          y: controller.y,
          level: controller.level,
          user: controller.user
        }
      })
      const sources = Object.values(event.data.objects).filter(obj => obj.type === 'source').map(source => {
        return {
          x: source.x,
          y: source.y,
          energyCapacity: source.energyCapacity
        }
      })

      resolve({
        lastUpdated: Math.floor(Date.now() / 1000),
        sources: sources,
        controller: controllers.length ? controllers[0] : null
      })
    })
  })
}

function writeMemorySegment (shard) {
  let changed = false
  for (const roomID in shards[shard].notYetPushedRooms) {
    if (shards[shard].notYetPushedRooms[roomID] === true) continue

    // Update response for room
    changed = true
    shards[shard].data.responses[roomID] = shards[shard].notYetPushedRooms[roomID]
    delete shards[shard].notYetPushedRooms[roomID]

    // Remove from requests
    const indexToRemove = shards[shard].data.requests.indexOf(roomID)
    if (indexToRemove !== -1) shards[shard].data.requests.splice(indexToRemove, 1)
  }
  if (!changed) return false // Nothing to push

  shards[shard].data.lastUpdated = Math.floor(Date.now() / 1000)
  api.segment.set(config.segment, cjson.compress.toString(shards[shard].data), shard).then(res => {
    if (res.error) throw new Error(res.error)
  }).catch(err => {
    if (err.message === 'length limit exceeded') {
      resetSegment(shard)
    }
    console.log(err)
  })
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

console.log(`Screeps Free Observer started!\nShards: ${config.shards.map(str => `'${str}'`).join(', ')}\nSegment: ${config.segment}`)
doReads()
