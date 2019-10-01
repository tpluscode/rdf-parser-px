class PxCube {
  constructor () {
    this.pairs = []
  }

  addPair (pair) {
    this.pairs.push(pair)
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
    return this.value('LANGUAGES').values
  }

  properties () {
    const defaultLanguage = this.defaultLanguage()
    const languages = this.languages()
    const values = this.values('VALUES', '')

    return values.map((value, index) => {
      const property = {
        labels: {},
        values: {}
      }

      property.labels[defaultLanguage] = value.subkey
      property.values[defaultLanguage] = value.values

      languages.forEach(language => {
        if (language === defaultLanguage) {
          return
        }

        const languageValue = this.values('VALUES', language)[index]

        property.labels[language] = languageValue.subkey
        property.values[language] = languageValue.values
      })

      return property
    }).reverse()
  }

  observations () {
    const properties = this.properties()
    const data = this.value('DATA')
    const shape = properties.map(property => Object.values(property.values)[0].length)

    let index = -1

    const next = () => {
      if (index === data.values.length - 1) {
        return { done: true }
      }

      index++

      const { dimensions } = shape.reduce(({ offset, dimensions }, size, valueIndex) => {
        const dimensionIndex = offset % size

        return {
          offset: Math.floor(offset / size),
          dimensions: dimensions.concat([{
            index: valueIndex,
            value: dimensionIndex
          }])
        }
      }, { offset: index, dimensions: [] })

      return {
        done: false,
        value: {
          index: index,
          dimensions: dimensions,
          data: data.values[index]
        }
      }
    }

    return {
      [Symbol.iterator]: () => {
        return { next }
      }
    }
  }
}

module.exports = PxCube
