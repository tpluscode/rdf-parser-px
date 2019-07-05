/* global describe, expect, test */

const fs = require('fs')
const namespace = require('@rdfjs/namespace')
const streamConcat = require('./support/streamConcat')
const RdfPxParser = require('..')

const ns = {
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

describe('rdf-parser-px', () => {
  test('converts the simple example to RDF', async () => {
    const expected = fs.readFileSync('test/support/simple.px.nt').toString().trim()
    const pxStream = fs.createReadStream('test/support/simple.px')

    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/' })
    const quadStream = parser.import(pxStream)

    const quads = await streamConcat(quadStream)
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
      titles: '@data',
      datatype: ns.xsd.double.value
    }]
    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/', columns })
    const quadStream = parser.import(pxStream)

    const quads = await streamConcat(quadStream)
    const ntriples = quads.map(quad => quad.toString()).join('\n').trim()

    expect(ntriples).toBe(expected)
  })

  test('converts the decimals example to double values', async () => {
    const expected = fs.readFileSync('test/support/decimals2.px.nt').toString().trim()
    const pxStream = fs.createReadStream('test/support/decimals2.px')

    const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/' })
    const quadStream = parser.import(pxStream)

    const quads = await streamConcat(quadStream)
    const ntriples = quads.map(quad => quad.toString()).join('\n').trim()

    expect(ntriples).toBe(expected)
  })
})
