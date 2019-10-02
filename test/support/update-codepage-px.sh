#!/bin/bash

cat codepage.px.txt | iconv -f utf-8 -t iso-8859-15 > codepage.px
cat codepage-not-defined.px.txt | iconv -f utf-8 -t iso-8859-15 > codepage-not-defined.px
