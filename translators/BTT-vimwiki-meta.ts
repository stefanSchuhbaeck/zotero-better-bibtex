declare const Zotero: any

import { Translator } from './lib/translator'
export { Translator }

import * as itemfields from '../gen/items/items'

function select_by_key(item) {
  const [ , kind, lib, key ] = item.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/)
  return (kind === 'users') ? `zotero://select/library/items/${key}` : `zotero://select/groups/${lib}/items/${key}`
}


function buildJson(item) {

  const [ , kind, lib, key ] = item.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/)
  item.select = (kind === 'users') ? `zotero://select/library/items/${key}` : `zotero://select/groups/${lib}/items/${key}`

  delete item.collections

  itemfields.simplifyForExport(item, Translator.options.dropAttachments)
  item.relations = item.relations ? (item.relations['dc:relation'] || []) : []

  const validAttachmentFields = new Set([ 'relations', 'uri', 'itemType', 'title', 'path', 'tags', 'dateAdded', 'dateModified', 'seeAlso', 'mimeType' ])

  for (const att of item.attachments || []) {
    if (Translator.options.exportFileData && att.saveFile && att.defaultPath) {
      att.saveFile(att.defaultPath, true)
      att.path = att.defaultPath
    } else if (att.localPath) {
      att.path = att.localPath
    }

    const [ , _kind, _lib, _key ] = att.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/)
    att.select = (_kind === 'users') ? `zotero://select/library/items/${_key}` : `zotero://select/groups/${_lib}/items/${_key}`

    if (!att.path) continue // amazon/googlebooks etc links show up as atachments without a path

    att.relations = att.relations ? (att.relations['dc:relation'] || []) : []
    for (const field of Object.keys(att)) {
      if (!validAttachmentFields.has(field)) {
        delete att[field]
      }
    }
  }

  // create clean json
  return JSON.parse(JSON.stringify(item))
}

export function doExport() {
  Translator.init('export')

  let item

  while ((item = Zotero.nextItem())) {
    const out = []
    if (Translator.options.dropAttachments && item.itemType === 'attachment') continue
    const jItem = buildJson(item)
    out.push('==  Meta  ==\n')

    // author
    const creators = item.creators || []
    const creator = creators[0] || {}
    let name = creator.name || creator.lastName || 'no author'
    if (creators.length > 1) name += ' et al.'
    out.push('* Author:     ' + name)

    // title
    if (item.title) {
      out.push('* Title:      ' + item.title)
    }

    // year
    if (item.date) {
      let date = Zotero.BetterBibTeX.parseDate(item.date)
      if (date.type === 'interval') date = date.from

      if (date.type === 'verbatim' || !date.year) {
        out.push('* Date:       ' + item.date)
      } else {
        out.push('* Date:       ' + date.year)
      }
    } else {
      out.push('* Date:       no date')
    }

    // dateAdded
    if(item.dateAdded){
       const tzone = Intl.DateTimeFormat().resolvedOptions().timeZone
       const t = new Date(item.dateAdded)
       const dateAddedTimeZoned = t.toLocaleString('de-DE', {timeZone: tzone })
       out.push('* DateAdded:  ' + dateAddedTimeZoned)
    }

    // zotero link
    const ckey = item.citationKey  // citation
    const zUrl = select_by_key(item) // select url
    out.push(`* zzCite:    [[${zUrl} | :zz-${ckey}: ]]`)

    // tags
    const _tagStr = []
    for (const _tag of jItem.tags  || []) {
      _tagStr.push(`:${_tag.tag}:`)
    }
    out.push('* zzTags:     ' + _tagStr.join(' '))
    Zotero.write(out.join('\n'))
 }

}
