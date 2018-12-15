class FreeObserver {
  /**
   * Initialize FreeObserver
   * @param {Number} segmentID
   */
  constructor (segmentID) {
    this.segmentID = segmentID
    this.pendingRequests = []
    this.data = false
  }

  /**
   * Request room to observe, and return room data if available. Returns false if not available yet
   * @param {String} roomName
   */
  getRoom (roomName) {
    this.pendingRequests.push(roomName)
    if (this.data && this.data.responses) return this.data.responses[roomName] || false
    return false
  }

  /**
   * Call every tick
   */
  tick () {
    RawMemory.setActiveSegments([this.segmentID])
    if (!RawMemory.segments[this.segmentID]) return false
    const tempData = JSON.parse(RawMemory.segments[this.segmentID])
    if (!tempData.requests || !Array.isArray(tempData.requests)) return false // Wait for server
    this.data = tempData

    // Add new pending requests
    this.pendingRequests.forEach((roomName, index) => {
      this.pendingRequests.splice(index, 1)
      if (this.data.requests.indexOf(roomName) === -1) {
        this.data.requests.push(roomName)
      }
    })

    // Add back to RawMemory
    RawMemory.segments[this.segmentID] = JSON.stringify(this.data)
  }
}

module.exports = FreeObserver
