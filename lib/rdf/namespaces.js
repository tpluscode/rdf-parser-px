const namespace = require('@rdfjs/namespace')

const ns = {
  qb: namespace('http://purl.org/linked-data/cube#'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  rdfs: namespace('http://www.w3.org/2000/01/rdf-schema#'),
  skos: namespace('http://www.w3.org/2004/02/skos/core#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

module.exports = ns
