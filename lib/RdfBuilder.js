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
    const { dimensionColumns, measureColumns } = this.buildColumns(cube)
    this.createProperties(cube, dimensionColumns, measureColumns)

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
      const observationTerm = rdf.namedNode(url.resolve(this.baseIRI, `data/${observation.row}`))

      this.push(rdf.quad(observationTerm, ns.rdf.type, ns.qb.Observation))

      observation.dimensions.forEach(dimension => {
        const column = dimensionColumns[dimension.index]

        this.push(rdf.quad(observationTerm, column.property, column.value(dimension.value)))
      })

      observation.measures.forEach(measure => {
        const column = measureColumns[measure.index]

        this.push(rdf.quad(observationTerm, column.property, column.value(measure.value)))
      })

      this.push(rdf.quad(observationTerm, ns.qb.dataSet, datasetTerm))
    })

    this.push(null)
  }

  buildColumns (cube) {
    const defaultLanguage = cube.defaultLanguage()

    const dimensionColumns = cube.dimensionProperties().map((property, propertyIndex) => {
      const metadata = this.metadata.find(column => column.titles === property.title) || {}

      return Column.forDimension({
        baseIRI: this.baseIRI,
        metadata,
        propertyIndex,
        title: property.title,
        values: property.values[defaultLanguage]
      })
    })

    const measureColumns = cube.measureProperties().map((property, propertyIndex) => {
      const metadata = this.metadata.find(column => column.titles === property.title) || {}

      return Column.forMeasure({
        baseIRI: this.baseIRI,
        metadata,
        propertyIndex,
        title: property.title,
        values: property.values[defaultLanguage]
      })
    })

    return { dimensionColumns, measureColumns }
  }

  createProperties (cube, dimensionColumns, measureColumns) {
    cube.dimensionProperties().forEach(property => {
      const column = dimensionColumns.find(column => column.title === property.title)
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

    cube.measureProperties().forEach(property => {
      const column = measureColumns.find(column => column.title === property.title)
      const subject = column.property

      this.push(rdf.quad(subject, ns.rdf.type, ns.qb.MeasureProperty))

      // create labels for properties
      Object.entries(property.labels).forEach(([language, label]) => {
        this.push(rdf.quad(subject, ns.rdfs.label, rdf.literal(label, language)))
      })
    })
  }
}

module.exports = RdfBuilder
