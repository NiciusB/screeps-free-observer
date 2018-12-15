# Screeps Free Observer

I didn't have any room with controller level 8 so I made this.

It's basically a very bad version of the Observer Structure, and it needs a server + an ingame client

## Installation
### Server

Download this repository, install npm dependencies, and create your config.json file. Then use pm2 or other tool to keep the node.js process alive

### Client

Copy the "client-api-screeps-free-observer.js" file to your code, and use the following code to import it:

    const FreeObserver = require('./includes.client-api-screeps-free-observer')
    global.freeObserver = new FreeObserver(3) // The argument is the memory segment to use, by default 3

## Usage
### Client

    global.freeObserver.tick() // Run this every tick
    global.freeObserver.getRoom('E11N29') // Returns false if not available yet, or an object with the data if available
