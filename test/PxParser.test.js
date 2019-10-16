/* global describe, expect, it */

const PxParser = require('../lib/PxParser')
const getStream = require('get-stream')

describe('PxParser', () => {
  it('should be a constructor', () => {
    expect(typeof PxParser).toBe('function')
  })

  describe('import', () => {
    it('should be a method', () => {
      const parser = new PxParser()

      expect(typeof parser.import).toBe('function')
    })

    it('should parse the key', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY=VALUE;'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].keyword).toBe('KEY')
      expect(pairs[0].subkey).toBe('')
      expect(pairs[0].language).toBe('')
    })

    it('should parse the subkey', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY("SUBKEY")=VALUE;'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].keyword).toBe('KEY')
      expect(pairs[0].subkey).toBe('SUBKEY')
      expect(pairs[0].language).toBe('')
    })

    it('should parse the language', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY[de]=VALUE;'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].keyword).toBe('KEY')
      expect(pairs[0].subkey).toBe('')
      expect(pairs[0].language).toBe('de')
    })

    it('should parse the subkey and language', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY[de]("SUBKEY")=VALUE;'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].keyword).toBe('KEY')
      expect(pairs[0].subkey).toBe('SUBKEY')
      expect(pairs[0].language).toBe('de')
    })

    it('should parse a value', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY=VALUE;'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].values).toEqual(['VALUE'])
    })

    it('should parse a quoted value', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY="VALUE";'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].values).toEqual(['VALUE'])
    })

    it('should parse a quoted value that contains a semicolon', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY="VALUE;ABC";'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].values).toEqual(['VALUE;ABC'])
    })

    it('should parse multiple values', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY="VALUE A","VALUE B";'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].values).toEqual(['VALUE A', 'VALUE B'])
    })

    it('should parse multi quoted value', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY="VALUE "\n"A";'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].values).toEqual(['VALUE A'])
    })

    it('should parse multiple pairs', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('KEY_A="B "\n"C";\nKEY_D[de]("SUBKEY_E")="F",G;'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(2)
      expect(pairs[0].keyword).toBe('KEY_A')
      expect(pairs[0].subkey).toBe('')
      expect(pairs[0].language).toBe('')
      expect(pairs[0].values).toEqual(['B C'])

      expect(pairs[1].keyword).toBe('KEY_D')
      expect(pairs[1].subkey).toBe('SUBKEY_E')
      expect(pairs[1].language).toBe('de')
      expect(pairs[1].values).toEqual(['F', 'G'])
    })

    it('should split DATA values separated by space', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('DATA=1 2 3;'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].values).toEqual(['1', '2', '3'])
    })

    it('should split DATA values separated by line breaks', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('DATA=1\n2\n3;'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].values).toEqual(['1', '2', '3'])
    })

    it('should support quoted DATA values', async () => {
      const parser = new PxParser()

      parser.import(Buffer.from('DATA="1" "2" "3";'))

      const pairs = await getStream.array(parser)

      expect(pairs.length).toBe(1)
      expect(pairs[0].values).toEqual(['1', '2', '3'])
    })
  })
})
