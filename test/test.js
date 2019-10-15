/* global describe, expect, test */

const fs = require('fs')
const namespace = require('@rdfjs/namespace')
const getStream = require('get-stream')
const RdfPxParser = require('..')

const ns = {
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

describe('rdf-parser-px', () => {
  test('is a constructor', () => {
    expect(typeof RdfPxParser).toBe('function')
  })

  test('converts the simple example to RDF', async () => {
    const expected = fs.readFileSync('test/support/simple.px.nt').toString().trim()
    const pxStream = fs.createReadStream('test/support/simple.px')

    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/' })
    const quadStream = parser.import(pxStream)

    const quads = await getStream.array(quadStream)
    const ntriples = quads.map(quad => quad.toString()).join('\n').trim()

    expect(ntriples).toBe(expected)
  })

  test('converts the heading example to RDF and spreads the values', async () => {
    const expected = fs.readFileSync('test/support/heading.px.nt').toString().trim()
    const pxStream = fs.createReadStream('test/support/heading.px')

    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/' })
    const quadStream = parser.import(pxStream)

    const quads = await getStream.array(quadStream)
    const ntriples = quads.map(quad => quad.toString()).join('\n').trim()

    expect(ntriples).toBe(expected)
  })

  test('converts the simple example to RDF using the given column definition', async () => {
    const expected = fs.readFileSync('test/support/simple.px.columns.nt').toString().trim()
    const pxStream = fs.createReadStream('test/support/simple.px')

    const columns = [{
      titles: 'Jahr',
      datatype: ns.xsd.gYear.value
    }, {
      titles: 'Wert',
      datatype: ns.xsd.double.value
    }]
    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/', columns })
    const quadStream = parser.import(pxStream)

    const quads = await getStream.array(quadStream)
    const ntriples = quads.map(quad => quad.toString()).join('\n').trim()

    expect(ntriples).toBe(expected)
  })

  test('converts the decimals example to double values', async () => {
    const expected = fs.readFileSync('test/support/decimals2.px.nt').toString().trim()
    const pxStream = fs.createReadStream('test/support/decimals2.px')

    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/' })
    const quadStream = parser.import(pxStream)

    const quads = await getStream.array(quadStream)
    const ntriples = quads.map(quad => quad.toString()).join('\n').trim()

    expect(ntriples).toBe(expected)
  })

  test('converts the codepage example using the given codepage', async () => {
    const expected = fs.readFileSync('test/support/codepage.px.nt').toString().trim()
    const pxStream = fs.createReadStream('test/support/codepage-not-defined.px')

    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/', encoding: 'iso-8859-15' })
    const quadStream = parser.import(pxStream)

    const quads = await getStream.array(quadStream)
    const ntriples = quads.map(quad => quad.toString()).join('\n').trim()

    expect(ntriples).toBe(expected)
  })

  test('converts the codepage example and reads the codepage from the pairs', async () => {
    const expected = fs.readFileSync('test/support/codepage.px.nt').toString().trim()
    const pxStream = fs.createReadStream('test/support/codepage.px')

    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/' })
    const quadStream = parser.import(pxStream)

    const quads = await getStream.array(quadStream)
    const ntriples = quads.map(quad => quad.toString()).join('\n').trim()

    expect(ntriples).toBe(expected)
  })

  test('throws an error when trying to convert the codepage example with a given encoding different to the one in the px files', async () => {
    const pxStream = fs.createReadStream('test/support/codepage.px')

    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/', encoding: 'utf-8' })

    await expect(Promise.resolve().then(async () => {
      const quadStream = parser.import(pxStream)
      await getStream.array(quadStream)
    })).rejects.toThrow()
  })
})
