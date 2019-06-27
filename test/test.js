/* global describe, expect, test */

const fs = require('fs')
const streamConcat = require('./support/streamConcat')
const RdfPxParser = require('..')

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
})
