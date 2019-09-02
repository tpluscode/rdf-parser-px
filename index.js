const concatStream = require('concat-stream')
const PxParser = require('./lib/PxParser')
const RdfBuilder = require('./lib/RdfBuilder')

class RdfPxParser {
  constructor ({ ...options }) {
    this.options = options
  }

  import (stream) {
    const builder = new RdfBuilder({ ...this.options })

    stream.pipe(concatStream(content => {
      try {
        const parser = new PxParser({ ...this.options })

        builder.import(parser.import(content))
      } catch (err) {
        builder.emit('error', err)
      }
    }))

    return builder
  }
}

module.exports = RdfPxParser
