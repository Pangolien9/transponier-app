import { INSTRUMENT_NAMES } from '../config/features.js'

function xmlToString(element) {
  return new XMLSerializer().serializeToString(element)
}

export function detectInstruments(musicXml) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(musicXml, 'text/xml')
  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('Ungültiges XML-Format.')
  }

  const root = xmlDoc.documentElement
  if (!root) throw new Error('Kein Root-Element im XML gefunden.')

  const partList = root.querySelector('part-list')
  if (!partList) {
    throw new Error('Kein part-list Element gefunden. Die Datei ist wahrscheinlich kein MusicXML.')
  }

  const scoreParts = [...partList.querySelectorAll('score-part')]
  if (scoreParts.length === 0) {
    throw new Error('Keine Instrumente in der Datei gefunden.')
  }

  const instruments = []
  let fallbackIndex = 1

  scoreParts.forEach((scorePart) => {
    const id = scorePart.getAttribute('id')
    if (!id) return

    const name = scorePart.querySelector('part-name')?.textContent?.trim()
      || `${INSTRUMENT_NAMES.fallback} ${fallbackIndex}`
    const partElement = xmlDoc.querySelector(`part[id="${id.replace(/"/g, '')}"]`)
    if (!partElement) return
    if (!partElement.querySelector('note, rest')) return

    instruments.push({
      id,
      name,
      musicXml,
      selected: false,
      transpose: 0,
      partXml: xmlToString(partElement),
      originalId: id,
    })
    fallbackIndex += 1
  })

  if (instruments.length === 0) {
    throw new Error('Keine Instrumente mit Noten gefunden.')
  }

  return instruments
}

export function isValidMusicXml(musicXml) {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(musicXml, 'text/xml')
    if (xmlDoc.querySelector('parsererror')) return false
    const root = xmlDoc.documentElement
    return root && (root.tagName === 'score-partwise' || root.tagName === 'score-timewise')
  } catch {
    return false
  }
}

export default {
  detectInstruments,
  isValidMusicXml,
}