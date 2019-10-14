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
- `encoding`: Encoding used for the PX file. The library tries to guess proper encoding of the PX file but not all of them provide information about the encoding used, this can override it accordingly. Needs to be a supported encoding by [iconv-lite](https://github.com/ashtuchkin/iconv-lite).

## CLI Tool 

The `px-to-nt` command line util converts PX files in the file system and writes them to a N-Triples file.
See `px-to-nt --help` for more details.

### Example

Download [this](https://www.pxweb.bfs.admin.ch/DownloadFile.aspx?file=px-x-0703010000_103) PX file with `wget`:

```
wget https://www.pxweb.bfs.admin.ch/DownloadFile.aspx?file=px-x-0703010000_103 -O px-x-0703010000_103.px
```
 
Now it can be converted:

```
px-to-nt --input=./px-x-0703010000_103.px --output=px-x-0703010000_103.nt --base=http://example.org/ --metadata=./examples/anzahl-forstbetriebe-ch.json --encoding=iso-8859-15
```
