const cjson = require('compressed-json')

class FreeObserver {
  /**
   * Initialize FreeObserver
   * @param {Number} segmentID
   */
  constructor (segmentID) {
    this.segmentID = segmentID
    this.requestsToAddNextTick = []
    /**
     * @type {{lastUpdated: number, requests: string[], responses: {{room: object.<string, object>, lastUpdated: number}}}|false}
     */
    this.data = false
  }

  /**
   * Request room to observe, and return room data if available. Returns false if not available yet
   * @param {String} roomName
   */
  getRoom (roomName) {
    this._markSegmentAsActive()
    this.requestsToAddNextTick.push(roomName)
    if (this.data && this.data.responses && this.data.responses[roomName]) {
      return this.data.responses[roomName].room || false
    }
    return false
  }

  _loadDataFromRawMemory () {
    if (!RawMemory.segments[this.segmentID]) return false
    const tempData = cjson.decompress.fromString(RawMemory.segments[this.segmentID])
    if (!tempData || !tempData.requests || !Array.isArray(tempData.requests)) return false // Wait for server
    this.data = tempData
    return true
  }

  _saveDataToRawMemory () {
    RawMemory.segments[this.segmentID] = cjson.compress.toString(this.data)
  }

  _markSegmentAsActive () {
    RawMemory.setActiveSegments([this.segmentID])
  }

  /**
   * Call every tick
   */
  tick () {
    if (!this.data || this.data.requests.length) {
      // Ether initializing, or reloading data from raw memory if we're expecting new data
      this._markSegmentAsActive()
      this._loadDataFromRawMemory()
    }

    if (!this.data) {
      return
    }

    if (this.requestsToAddNextTick.length) {
      // Add new pending requests
      this.requestsToAddNextTick.forEach((roomName, index) => {
        this.requestsToAddNextTick.splice(index, 1)
        if (this.data.requests.indexOf(roomName) === -1) {
          this.data.requests.push(roomName)
        }
      })

      this._saveDataToRawMemory()
    }
  }
}

module.exports = FreeObserver
