const getStream = require('get-stream')
const PxCube = require('./lib/PxCube')
const PxParser = require('./lib/PxParser')
const RdfBuilder = require('./lib/RdfBuilder')

class RdfPxParser {
  constructor ({ ...options }) {
    this.options = options
  }

  import (stream) {
    const builder = new RdfBuilder({ ...this.options })
    const cube = new PxCube()

    Promise.resolve().then(async () => {
      try {
        const content = await getStream.buffer(stream)
        const parser = new PxParser({ ...this.options })

        parser.import(content)

        const pairs = await getStream.array(parser)

        pairs.forEach(pair => cube.addPair(pair))
        cube.finished()

        builder.import(cube)
      } catch (err) {
        builder.emit('error', err)
      }
    })

    return builder
  }
}

module.exports = RdfPxParser
