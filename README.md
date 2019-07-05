# rdf-parser-px

A RDF/JS Parser for the [PX-file format](https://www.scb.se/globalassets/vara-tjanster/px-programmen/px-file_format_specification_2013.pdf).

## Usage

The package returns a class with a [RDF/JS Sink interface](http://rdf.js.org/stream-spec/#sink-interface).
To parse a PX stream, an instance must be created and `.import()` must be called with PX stream as argument like in the example below:

```
const fs = require('fs')
const RdfPxParser = require('rdf-parser-px')

const pxStream = fs.createReadStream('test/support/simple.px')
const parser = new RdfPxParser({ baseIRI: 'http://example.org/simple/' })
const quadStream = parser.import(pxStream)
```

## Options

The constructor of the parser supports the following options:

- `baseIRI`: IRI used for the property, values, dataset and observations.
  This options is required!
- `columns`: Metadata for columns given as array of objects.
  Each object must contain a `titles` property to identify the column.
  The value must match the subkey in the default language.
  The value `@data` must be used for the measure values.
  Changing the datatype is possible with the `datatype` property.
  The property must be the string value of the full IRI of the datatype.
  If the `datatype` property is used for dimensions, literals are used. 
