const ns = require('./namespaces')
const rdf = require('rdf-ext')
const url = require('url')

class Column {
  constructor ({ baseIRI, datatype, decimals = 0, measure, property, title, values }) {
    this.baseIRI = baseIRI
    this.datatype = datatype
    this.decimals = decimals
    this.decimalFactor = 1.0 / Math.pow(10, decimals)
    this.measure = measure
    this.property = property
    this.title = title
    this.values = values
  }

  isNamedNode () {
    return !this.datatype
  }

  value (indexOrRaw) {
    if (this.values) {
      return this.values[indexOrRaw]
    }

    if (this.decimals !== 0) {
      const valueStr = (parseInt(indexOrRaw) * this.decimalFactor).toFixed(this.decimals)

      return rdf.literal(valueStr, this.datatype)
    }

    return rdf.literal(indexOrRaw, this.datatype)
  }

  static forDimension ({ baseIRI, metadata, propertyIndex, title, values }) {
    const valueTerms = values.map((value, valueIndex) => {
      if (metadata.datatype) {
        return rdf.literal(value, rdf.namedNode(metadata.datatype))
      }

      return rdf.namedNode(url.resolve(baseIRI, `dimension/${propertyIndex}/${valueIndex}`))
    })

    return new Column({
      baseIRI,
      datatype: metadata.datatype,
      property: rdf.namedNode(url.resolve(baseIRI, `dimension/${propertyIndex}`)),
      title,
      values: valueTerms
    })
  }

  static forMeasure ({ baseIRI, decimals = 0, metadata, propertyIndex, title }) {
    let datatype = ns.xsd.integer

    if (decimals !== 0) {
      datatype = ns.xsd.decimal.value
    }

    if (metadata.datatype) {
      datatype = metadata.datatype
    }

    return new Column({
      baseIRI,
      datatype,
      decimals,
      measure: true,
      property: rdf.namedNode(url.resolve(baseIRI, `measure/${propertyIndex}`)),
      title
    })
  }
}

module.exports = Column
