declare const Zotero: any

// import format = require('string-template')

import { Translator } from './lib/translator'
export { Translator }

// import { normalize } from './lib/normalize'



function select_by_key(item) {
  const [ , kind, lib, key ] = item.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/)
  return (kind === 'users') ? `zotero://select/library/items/${key}` : `zotero://select/groups/${lib}/items/${key}`
}


export function doExport() {
  Translator.init('export')

  let item
  while ((item = Zotero.nextItem())) {
    const ckey = item.citationKey  // citation
    const zUrl = select_by_key(item) // select url
    Zotero.write(`[[${zUrl} | :zt-${ckey}: ]]`)
  }
}
