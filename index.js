const concatStream = require('concat-stream')
const PxParser = require('./lib/PxParser')
const RdfBuilder = require('./lib/RdfBuilder')

class RdfPxParser {
  constructor ({ baseIRI, ...options }) {
    this.baseIRI = baseIRI
    this.options = options
  }

  import (stream) {
    const builder = new RdfBuilder({ baseIRI: this.baseIRI, ...this.options })

    stream.pipe(concatStream(content => {
      const parser = new PxParser()

      builder.import(parser.import(content))
    }))

    return builder
  }
}

module.exports = RdfPxParser
