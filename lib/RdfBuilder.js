const ns = require('./rdf/namespaces')
const rdf = require('rdf-ext')
const { Readable } = require('readable-stream')
const url = require('url')
const Column = require('./rdf/Column')

class RdfBuilder extends Readable {
  constructor ({ baseIRI, columns = [] }) {
    super({
      objectMode: true,
      read: () => {}
    })

    this.baseIRI = baseIRI
    this.metadata = columns
  }

  import (cube) {
    const columns = this.buildColumns(cube)
    this.createProperties(cube, columns)

    const defaultLanguage = cube.defaultLanguage()
    const datasetTerm = rdf.namedNode(url.resolve(this.baseIRI, 'dataset'))
    this.push(rdf.quad(datasetTerm, ns.rdf.type, ns.qb.DataSet))

    cube.values('DESCRIPTION').forEach(value => {
      this.push(rdf.quad(datasetTerm, ns.rdfs.label, rdf.literal(value.values[0], value.language || defaultLanguage)))
    })

    cube.values('TITLE').forEach(value => {
      this.push(rdf.quad(datasetTerm, ns.rdfs.comment, rdf.literal(value.values[0], value.language || defaultLanguage)))
    })

    const subjectCode = cube.value('SUBJECT-CODE')

    if (subjectCode) {
      this.push(rdf.quad(datasetTerm, ns.skos.notation, rdf.literal(subjectCode.values[0])))
    }

    const observations = [...cube.observations()]

    observations.forEach(observation => {
      const observationTerm = rdf.namedNode(url.resolve(this.baseIRI, `data/${observation.index}`))

      this.push(rdf.quad(observationTerm, ns.rdf.type, ns.qb.Observation))

      observation.dimensions.forEach(dimension => {
        const column = columns[dimension.index]

        this.push(rdf.quad(observationTerm, column.property, column.value(dimension.value)))
      })

      const column = columns.slice(-1)[0]
      const object = column.value(observation.data)

      this.push(rdf.quad(observationTerm, column.property, object))
      this.push(rdf.quad(observationTerm, ns.qb.dataSet, datasetTerm))
    })

    this.push(null)
  }

  buildColumns (cube) {
    const defaultLanguage = cube.defaultLanguage()
    const properties = cube.properties()

    const dimensionsColumns = properties.map((property, propertyIndex) => {
      const title = property.labels[defaultLanguage]
      const metadata = this.metadata.find(column => column.titles === title) || {}

      return Column.forDimension({
        baseIRI: this.baseIRI,
        metadata,
        propertyIndex,
        values: property.values[defaultLanguage]
      })
    })

    const metadata = this.metadata.find(column => column.titles === '@data') || {}
    const decimals = (cube.value('DECIMALS') || { values: [] }).values[0]
    const measureColumns = [ Column.forMeasure({ baseIRI: this.baseIRI, metadata, decimals }) ]

    return dimensionsColumns.concat(measureColumns)
  }

  createProperties (cube, columns) {
    cube.properties().forEach((property, index) => {
      const column = columns[index]
      const subject = column.property

      this.push(rdf.quad(subject, ns.rdf.type, ns.qb.DimensionProperty))

      // create labels for properties
      Object.entries(property.labels).forEach(([language, label]) => {
        this.push(rdf.quad(subject, ns.rdfs.label, rdf.literal(label, language)))
      })

      // if column values are literals, there is no need to create a value list
      if (!column.isNamedNode()) {
        return
      }

      // also when the values are generated on the fly
      if (!column.values) {
        return
      }

      // create labels for property values
      Object.entries(property.values).forEach(([language, values]) => {
        values.forEach((label, valueIndex) => {
          this.push(rdf.quad(column.values[valueIndex], ns.rdfs.label, rdf.literal(label, language)))
        })
      })
    })

    // type and label for value property
    const column = columns.filter(column => Boolean(column.measure))[0]
    const subject = column.property

    this.push(rdf.quad(subject, ns.rdf.type, ns.qb.MeasureProperty))

    cube.values('HEADING').forEach(heading => {
      const value = cube.value('VALUES', heading.language, heading.values[0])

      if (!value) {
        return
      }

      const language = heading.language || cube.defaultLanguage()

      value.values.forEach(label => {
        this.push(rdf.quad(subject, ns.rdfs.label, rdf.literal(label, language)))
      })
    })
  }
}

module.exports = RdfBuilder
