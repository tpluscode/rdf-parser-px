const ns = require('./namespaces')
const rdf = require('rdf-ext')
const url = require('url')

class Column {
  constructor ({ baseIRI, property, values, datatype, decimals = 0 }) {
    this.baseIRI = baseIRI
    this.datatype = datatype
    this.property = property
    this.values = values
    this.decimals = decimals
    this.decimalFactor = 1.0 / Math.pow(10, decimals)
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

  static forMeasure ({ baseIRI, metadata, decimals = 0 }) {
    let datatype = ns.xsd.integer

    if (decimals !== 0) {
      datatype = ns.xsd.decimal.value
    }

    if (metadata.datatype) {
      datatype = metadata.datatype
    }

    return new Column({
      baseIRI,
      property: rdf.namedNode(url.resolve(baseIRI, `property/value`)),
      datatype,
      decimals
    })
  }
}

module.exports = Column
