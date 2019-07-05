const ns = require('./namespaces')
const rdf = require('rdf-ext')
const url = require('url')

class Column {
  constructor ({ baseIRI, property, values, datatype }) {
    this.baseIRI = baseIRI
    this.datatype = datatype
    this.property = property
    this.values = values
  }

  isNamedNode () {
    return !this.datatype
  }

  value (indexOrRaw) {
    if (this.values) {
      return this.values[indexOrRaw]
    }

    return rdf.literal(indexOrRaw, this.datatype)
  }

  static forDimension ({ baseIRI, metadata, propertyIndex, values }) {
    const valueTerms = values.map((value, valueIndex) => {
      if (metadata.datatype) {
        return rdf.literal(value, rdf.namedNode(metadata.datatype))
      }

      return rdf.namedNode(url.resolve(baseIRI, `property/${propertyIndex}/${valueIndex}`))
    })

    return new Column({
      baseIRI,
      property: rdf.namedNode(url.resolve(baseIRI, `property/${propertyIndex}`)),
      values: valueTerms,
      datatype: metadata.datatype
    })
  }

  static forMeasure ({ baseIRI, metadata }) {
    return new Column({
      baseIRI,
      property: rdf.namedNode(url.resolve(baseIRI, `property/value`)),
      datatype: metadata.datatype || ns.xsd.integer
    })
  }
}

module.exports = Column
