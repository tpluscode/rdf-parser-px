class PxCube {
  constructor () {
    this.pairs = []
  }

  addPair (pair) {
    this.pairs.push(pair)
  }

  finished () {
    const defaultLanguage = this.defaultLanguage()

    this.pairs.forEach(pair => {
      pair.language = pair.language || defaultLanguage
    })
  }

  value (keyword, language, subkey) {
    return this.values(keyword, language, subkey)[0]
  }

  values (keyword, language, subkey) {
    return this.pairs.filter(pair => {
      if (pair.keyword !== keyword) {
        return false
      }

      if (typeof language === 'string' && pair.language !== language) {
        return false
      }

      if (typeof subkey === 'string' && pair.subkey !== subkey) {
        return false
      }

      return true
    })
  }

  defaultLanguage () {
    return this.value('LANGUAGE').values[0]
  }

  languages () {
    const languages = this.value('LANGUAGES')

    return (languages && languages.values) || [this.defaultLanguage()]
  }

  dimensionProperties () {
    const defaultLanguage = this.defaultLanguage()
    const languages = this.languages()
    const stub = this.value('STUB', defaultLanguage)

    return stub.values.map((title, index) => {
      const property = {
        title,
        labels: {},
        values: {}
      }

      languages.forEach(language => {
        const localTitle = this.value('STUB', language).values[index]
        const languageValue = this.value('VALUES', language, localTitle)

        property.labels[language] = languageValue.subkey
        property.values[language] = languageValue.values
      })

      return property
    })
  }

  measureProperties () {
    const defaultLanguage = this.defaultLanguage()
    const languages = this.languages()
    const heading = this.value('HEADING', defaultLanguage).values[0]
    const values = this.value('VALUES', defaultLanguage, heading)

    return values.values.map((title, index) => {
      const property = {
        title,
        labels: {},
        values: {}
      }

      languages.forEach(language => {
        const localHeading = this.value('HEADING', language).values[0]

        property.labels[language] = this.value('VALUES', language, localHeading).values[index]
      })

      return property
    })
  }

  observations () {
    const dimensionProperties = this.dimensionProperties()
    const measureProperties = this.measureProperties()
    const data = this.value('DATA')
    const shape = dimensionProperties.map(property => Object.values(property.values)[0].length)

    let row = 0

    const next = () => {
      if (row >= data.values.length / measureProperties.length) {
        return { done: true }
      }

      const dimensions = []
      let valueIndex = row

      for (let dimensionIndex = dimensionProperties.length - 1; dimensionIndex >= 0; dimensionIndex--) {
        dimensions.unshift({
          index: dimensionIndex,
          property: dimensionProperties[dimensionIndex],
          value: valueIndex % shape[dimensionIndex]
        })

        valueIndex = Math.floor(valueIndex / shape[dimensionIndex])
      }

      const start = row * measureProperties.length
      const end = start + measureProperties.length

      const measures = data.values.slice(start, end).map((value, index) => {
        return {
          index,
          property: measureProperties[index],
          value
        }
      })

      const result = {
        done: false,
        value: {
          row,
          dimensions,
          measures
        }
      }
      row++

      return result
    }

    return {
      [Symbol.iterator]: () => {
        return { next }
      }
    }
  }
}

module.exports = PxCube
