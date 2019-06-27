const fetch = require('node-fetch')
const RdfPxParser = require('..')

async function main () {
  const url = 'https://www.pxweb.bfs.admin.ch/DownloadFile.aspx?file=px-x-0703010000_103'
  const pxStream = (await fetch(url)).body

  const parser = new RdfPxParser({ baseIRI: 'http://example.org/anzahl-forstbetriebe/' })
  const quadStream = parser.import(pxStream)

  quadStream.on('data', quad => {
    console.log(quad.toString())
  })
}

main()
