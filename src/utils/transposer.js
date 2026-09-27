const NOTE_VALUES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const SHARP_NOTES = [
  ['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0],
  ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0],
]
const FLAT_NOTES = [
  ['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0],
  ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0],
]

function midiFromPitch(step, alter, octave) {
  return (octave + 1) * 12 + (NOTE_VALUES[step] ?? 0) + alter
}

function pitchFromMidi(midi, preferFlat) {
  const normalized = ((midi % 12) + 12) % 12
  const [step, alter] = (preferFlat ? FLAT_NOTES : SHARP_NOTES)[normalized]
  const octave = Math.floor(midi / 12) - 1
  return { step, alter, octave }
}

function fifthsFromSemitones(fifths, semitones) {
  const circle = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]
  const index = circle.indexOf(((fifths % 12) + 12) % 12)
  const next = circle[(index + semitones + 12) % 12]
  let result = next > 6 ? next - 12 : next
  if (fifths <= -1 && result > 0) result -= 12
  if (fifths >= 1 && result < 0) result += 12
  return result
}

function preferFlats(fifths) {
  return fifths < 0
}

function setOrRemoveAlter(doc, pitch, alterEl, octaveEl, alter) {
  if (alter) {
    if (alterEl) {
      alterEl.textContent = String(alter)
    } else {
      const created = doc.createElement('alter')
      created.textContent = String(alter)
      pitch.insertBefore(created, octaveEl)
    }
  } else if (alterEl) {
    pitch.removeChild(alterEl)
  }
}

export function isValidTransposition(semitones) {
  return Number.isInteger(semitones) && semitones >= -12 && semitones <= 12
}

export function calculateTransposition(step, alter, octave, semitones, useFlats = false) {
  const midi = midiFromPitch(step, alter, octave) + semitones
  return pitchFromMidi(midi, useFlats)
}

export function transposeMusic(musicXml, semitones) {
  if (!isValidTransposition(semitones)) {
    throw new Error(`Ungültige Transposition: ${semitones}. Muss zwischen -12 und +12 liegen.`)
  }
  if (semitones === 0) return musicXml

  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(musicXml, 'text/xml')
  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('MusicXML konnte nicht transponiert werden.')
  }

  let currentFifths = 0
  xmlDoc.querySelectorAll('key > fifths').forEach((el) => {
    const next = fifthsFromSemitones(parseInt(el.textContent, 10) || 0, semitones)
    el.textContent = String(next)
    currentFifths = next
  })

  xmlDoc.querySelectorAll('note').forEach((note) => {
    const pitch = note.querySelector('pitch')
    if (!pitch) return
    const stepEl = pitch.querySelector('step')
    const octaveEl = pitch.querySelector('octave')
    const alterEl = pitch.querySelector('alter')
    if (!stepEl || !octaveEl) return

    const midi = midiFromPitch(
      stepEl.textContent.trim(),
      alterEl ? parseInt(alterEl.textContent, 10) || 0 : 0,
      parseInt(octaveEl.textContent, 10) || 4
    ) + semitones

    const next = pitchFromMidi(midi, preferFlats(currentFifths))
    stepEl.textContent = next.step
    octaveEl.textContent = String(Math.max(0, Math.min(9, next.octave)))
    setOrRemoveAlter(xmlDoc, pitch, alterEl, octaveEl, next.alter)

    const accidental = note.querySelector('accidental')
    if (accidental) accidental.remove()
  })

  return new XMLSerializer().serializeToString(xmlDoc)
}

export function extractPartScore(musicXml, partId, partName = 'Stimme') {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(musicXml, 'text/xml')
  const root = xmlDoc.documentElement
  const part = xmlDoc.querySelector(`part[id="${partId}"]`)
  const scorePart = xmlDoc.querySelector(`score-part[id="${partId}"]`)
  if (!part) throw new Error(`Stimme ${partId} nicht gefunden.`)

  const work = root.querySelector('work')
  const identification = root.querySelector('identification')
  const defaults = root.querySelector('defaults')
  const credit = [...xmlDoc.querySelectorAll('credit')].map((el) => el.outerHTML).join('')

  const partNameXml = scorePart
    ? scorePart.outerHTML
    : `<score-part id="${partId}"><part-name>${partName}</part-name></score-part>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  ${work ? work.outerHTML : ''}
  ${identification ? identification.outerHTML : ''}
  ${defaults ? defaults.outerHTML : ''}
  ${credit}
  <part-list>${partNameXml}</part-list>
  ${part.outerHTML}
</score-partwise>`
}

export function transposePart(partXml, semitones) {
  return transposeMusic(partXml, semitones)
}

export default {
  transposeMusic,
  transposePart,
  extractPartScore,
  isValidTransposition,
  calculateTransposition,
}