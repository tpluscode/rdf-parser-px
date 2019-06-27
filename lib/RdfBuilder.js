const namespace = require('@rdfjs/namespace')
const rdf = require('rdf-ext')
const { Readable } = require('readable-stream')
const url = require('url')

const ns = {
  qb: namespace('http://purl.org/linked-data/cube#'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  rdfs: namespace('http://www.w3.org/2000/01/rdf-schema#')
}

class RdfBuilder extends Readable {
  constructor ({ baseIRI }) {
    super({
      objectMode: true,
      read: () => {}
    })

    this.baseIRI = baseIRI
  }

  import (cube) {
    const datasetTerm = rdf.namedNode(url.resolve(this.baseIRI, 'dataset'))
    const properties = this.buildProperties(cube)
    const observations = [...cube.observations()]

    this.push(rdf.quad(datasetTerm, ns.rdf.type, ns.qb.DataSet))

    observations.forEach(observation => {
      const observationTerm = rdf.namedNode(url.resolve(this.baseIRI, `data/${observation.index}`))

      this.push(rdf.quad(observationTerm, ns.rdf.type, ns.qb.Observation))

      observation.dimensions.forEach(dimension => {
        const predicate = properties[dimension.index].term
        const object = properties[dimension.index].values[dimension.value].term

        this.push(rdf.quad(observationTerm, predicate, object))
      })

      const predicate = rdf.namedNode(url.resolve(this.baseIRI, `property/value`))
      const object = rdf.literal(observation.data)

      this.push(rdf.quad(observationTerm, predicate, object))
      this.push(rdf.quad(observationTerm, ns.qb.dataSet, datasetTerm))
    })

    this.push(null)
  }

  buildProperties (cube) {
    return cube.properties().map((property, index) => {
      const subject = rdf.namedNode(url.resolve(this.baseIRI, `property/${index}`))

      Object.entries(property.labels).forEach(([language, label]) => {
        this.push(rdf.quad(subject, ns.rdfs.label, rdf.literal(label, language)))
      })

      const valueSubjects = Object.values(property.values)[0].map((value, valueIndex) => {
        return {
          term: rdf.namedNode(url.resolve(this.baseIRI, `property/${index}/${valueIndex}`))
        }
      })

      Object.entries(property.values).forEach(([language, values]) => {
        values.forEach((value, valueIndex) => {
          this.push(rdf.quad(valueSubjects[valueIndex].term, ns.rdfs.label, rdf.literal(value, language)))
        })
      })

      return {
        term: subject,
        values: valueSubjects
      }
    })
  }
}

module.exports = RdfBuilder
