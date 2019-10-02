/* global describe, expect, test */

const fs = require('fs')
const PxCube = require('../lib/PxCube')
const PxParser = require('../lib/PxParser')

const simplePxContent = fs.readFileSync('test/support/simple.px')

describe('PxParser', () => {
  test('is a constructor', () => {
    expect(typeof PxParser).toBe('function')
  })

  describe('import', () => {
    test('is a method', () => {
      const parser = new PxParser()

      expect(typeof parser.import).toBe('function')
    })

    test('returns a PxCube', () => {
      const parser = new PxParser()

      const cube = parser.import(simplePxContent)

      expect(cube instanceof PxCube).toBe(true)
    })

    test('adds the key value pairs to the PxCube', () => {
      const parser = new PxParser()
      const cube = parser.import(simplePxContent)

      expect(cube.pairs.length).toBe(29)
      expect(cube.pairs[23]).toEqual({
        keyword: 'VALUES',
        language: 'fr',
        subkey: 'Annee',
        values: [ '2004', '2005' ]
      })
    })
  })
})
