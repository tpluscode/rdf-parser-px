const iconv = require('iconv-lite')
const PxCube = require('./PxCube')

class PxParser {
  constructor ({ encoding } = {}) {
    this.raw = null
    this.encoding = encoding
    this.content = null
    this.offset = 0
  }

  import (raw) {
    this.raw = raw
    this.content = iconv.decode(this.raw, this.encoding || 'ascii')

    const cube = new PxCube()

    while (this.content) {
      cube.addPair(this.parsePair(this.content))
    }

    cube.finished()

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

      // first check strings if nothing was found try digits
      const [match, value] = content.match(new RegExp('"([^"]*)",?[\\s]*')) || content.match(new RegExp('(\\d*),?[\\s]*'))

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
    this.offset += match.length

    // change the encoding if the current keyword is "CODEPAGE"
    if (keyword === 'CODEPAGE') {
      // throw an error if the encoding argument is given and it doesn't match the codepage
      // because a non-default encoding may lead to wrong offsets
      if (this.encoding && values[0] !== this.encoding) {
        throw new Error(`The codepage defined in the PX data is different to the given one (px: "${values[0]}", arg: "${this.encoding}")`)
      }

      this.content = iconv.decode(this.raw.slice(this.offset), values[0])
    }

    return { keyword, language, subkey, values }
  }
}

module.exports = PxParser
