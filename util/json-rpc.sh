#!/bin/bash

#curl http://localhost:23119/better-bibtex/json-rpc -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data-binary '{"jsonrpc": "2.0", "method": "item.bibliography", "params": [["bentley_academic_2011", "ShelahnoteHanfnumbers1970" ], { "quickCopy": true }] }'
curl http://localhost:23119/better-bibtex/json-rpc -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data-binary '{"jsonrpc": "2.0", "method": "collection.scanAUX", "params": [{ "libraryID": 1, "key": "P5RPA64T"} , "/Users/emile/Downloads/output.aux"] }'