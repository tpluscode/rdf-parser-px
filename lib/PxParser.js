const PxCube = require('./PxCube')

class PxParser {
  constructor ({ encoding = 'ascii' } = {}) {
    this.raw = null
    this.encoding = encoding
    this.content = null
  }

  import (raw) {
    this.raw = raw
    this.content = this.raw.toString(this.encoding)

    const cube = new PxCube()

    while (this.content) {
      cube.addPair(this.parsePair(this.content))
    }

    return cube
  }

  parseKey (key) {
    const [ , keyword, , language, , subkey ] = key.match(new RegExp('([^\\[;^\\("]*)(\\[([^\\]]*)\\])?(\\("([^"]*)"\\))?'))

    return {
      keyword,
      language: language || '',
      subkey: subkey || ''
    }
  }

  parseValues (keyword, content) {
    const values = []

    if (keyword === 'DATA') {
      return content.replace(new RegExp('\\s?\\n', 'g'), ' ').trim().split(new RegExp('[, ;\\t]+'))
    }

    while (content) {
      if (content.startsWith('TLIST(')) {
        content = ''

        continue
      }

      const [match, value] = content.match(new RegExp('"([^"]*)",?[\\s]*|(\\d)*'))

      values.push(value)

      content = content.slice(match.length)
    }

    return values
  }

  parsePair () {
    const [match, rawKey, rawValues] = this.content.match(new RegExp('([^=]*)=([^;]*);[\\s]*'))
    const { keyword, language, subkey } = this.parseKey(rawKey)
    const values = this.parseValues(keyword, rawValues)

    this.content = this.content.slice(match.length)

    return { keyword, language, subkey, values }
  }
}

module.exports = PxParser
