const DURATION_TYPES = {
  longa: 'long',
  long: 'long',
  breve: 'breve',
  whole: 'whole',
  half: 'half',
  quarter: 'quarter',
  eighth: 'eighth',
  '16th': '16th',
  '32nd': '32nd',
  '64th': '64th',
  '128th': '128th',
  '256th': '256th',
}

const DURATION_DIVISIONS = {
  long: 3840,
  breve: 1920,
  whole: 960,
  half: 480,
  quarter: 240,
  eighth: 120,
  '16th': 60,
  '32nd': 30,
  '64th': 15,
  '128th': 8,
  '256th': 4,
}

const DIVISIONS = 240
const STEP_NAMES = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
const CLEF_MAP = {
  G: { sign: 'G', line: 2 },
  G8va: { sign: 'G', line: 2, octave: 1 },
  G8vb: { sign: 'G', line: 2, octave: -1 },
  F: { sign: 'F', line: 4 },
  F8vb: { sign: 'F', line: 4, octave: -1 },
  C: { sign: 'C', line: 3 },
  C1: { sign: 'C', line: 1 },
  C2: { sign: 'C', line: 2 },
  C3: { sign: 'C', line: 3 },
  C4: { sign: 'C', line: 4 },
  C5: { sign: 'C', line: 5 },
  PERC: { sign: 'percussion', line: 2 },
}

export function isMuseScoreXml(xml) {
  return /<museScore/i.test(xml)
}

export function isMusicXml(xml) {
  return /<(score-partwise|score-timewise)/i.test(xml)
}

function text(el, selector) {
  const found = selector ? el.querySelector(selector) : el
  return found?.textContent?.trim() || ''
}

function childrenByTag(el, tag) {
  return [...el.children].filter((child) => child.tagName === tag)
}

function tpcToPitch(midi, tpc) {
  const step = STEP_NAMES[((tpc + 1) % 7 + 7) % 7]
  const alter = Math.floor((tpc + 1) / 7) - 2
  const stepSemitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[step]
  const octave = Math.round((midi - stepSemitone - alter) / 12) - 1
  return { step, alter, octave }
}

function midiToPitch(midi) {
  const pc = ((midi % 12) + 12) % 12
  const table = [
    ['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0],
    ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0],
  ]
  const [step, alter] = table[pc]
  const octave = Math.floor(midi / 12) - 1
  return { step, alter, octave }
}

function durationValue(durationType, dots = 0) {
  let value = DURATION_DIVISIONS[DURATION_TYPES[durationType] || durationType] || DIVISIONS
  let extra = value
  for (let i = 0; i < dots; i += 1) {
    extra = Math.floor(extra / 2)
    value += extra
  }
  return value
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pitchXml({ step, alter, octave }) {
  return `<pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${octave}</octave></pitch>`
}

function parseClef(clefEl) {
  const raw = text(clefEl, 'concertClefType') || text(clefEl, 'clefType') || text(clefEl, 'transposingClefType') || 'G'
  return CLEF_MAP[raw] || CLEF_MAP.G
}

function noteXml(noteEl, durationType, dots, chord, voice, staffNumber, measureRest = false) {
  const rest = noteEl.tagName === 'Rest'
  const type = DURATION_TYPES[durationType] || 'quarter'
  const dotsXml = Array.from({ length: dots }, () => '<dot/>').join('')
  const duration = measureRest ? DIVISIONS * 4 : durationValue(durationType, dots)

  if (rest) {
    return `<note>
      ${chord ? '<chord/>' : ''}
      <rest${measureRest ? ' measure="yes"' : ''}/>
      <duration>${duration}</duration>
      <voice>${voice}</voice>
      ${measureRest ? '' : `<type>${type}</type>`}
      ${dotsXml}
      <staff>${staffNumber}</staff>
    </note>`
  }

  const midi = parseInt(text(noteEl, 'pitch') || '60', 10)
  const tpcRaw = text(noteEl, 'tpc')
  const pitch = tpcRaw !== '' ? tpcToPitch(midi, parseInt(tpcRaw, 10)) : midiToPitch(midi)
  const accidental = text(noteEl, 'Accidental > subtype') || text(noteEl, 'accidental')

  return `<note>
    ${chord ? '<chord/>' : ''}
    ${pitchXml(pitch)}
    <duration>${duration}</duration>
    <voice>${voice}</voice>
    <type>${type}</type>
    ${dotsXml}
    ${accidental ? `<accidental>${xmlEscape(accidental)}</accidental>` : ''}
    <staff>${staffNumber}</staff>
  </note>`
}

function convertMeasure(measureEl, staffNumber, partStaffCount) {
  const voices = childrenByTag(measureEl, 'voice')
  const sourceVoices = voices.length ? voices : [measureEl]
  let attributes = ''
  let notes = ''
  let firstVoice = true

  sourceVoices.forEach((voiceEl, voiceIndex) => {
    const voiceNumber = voiceIndex + 1
    let pendingChord = null
    let pendingDurationType = 'quarter'
    let pendingDots = 0

    ;[...voiceEl.children].forEach((child) => {
      const tag = child.tagName

      if (tag === 'TimeSig' && firstVoice) {
        attributes += `<time><beats>${text(child, 'sigN') || '4'}</beats><beat-type>${text(child, 'sigD') || '4'}</beat-type></time>`
      } else if (tag === 'KeySig' && firstVoice) {
        const fifths = text(child, 'accidental') || '0'
        attributes += `<key><fifths>${fifths}</fifths></key>`
      } else if (tag === 'Clef' && firstVoice) {
        const clef = parseClef(child)
        attributes += `<clef${partStaffCount > 1 ? ` number="${staffNumber}"` : ''}><sign>${clef.sign}</sign><line>${clef.line}</line>${clef.octave ? `<clef-octave-change>${clef.octave}</clef-octave-change>` : ''}</clef>`
      } else if (tag === 'Rest') {
        const durationType = text(child, 'durationType') || 'quarter'
        const dots = parseInt(text(child, 'dots') || '0', 10)
        const measureRest = durationType === 'measure'
        notes += noteXml(child, measureRest ? 'whole' : durationType, dots, false, voiceNumber, staffNumber, measureRest)
      } else if (tag === 'Chord') {
        const durationType = text(child, 'durationType') || 'quarter'
        const dots = parseInt(text(child, 'dots') || '0', 10)
        const chordNotes = childrenByTag(child, 'Note')
        chordNotes.forEach((noteEl, index) => {
          notes += noteXml(noteEl, durationType, dots, index > 0, voiceNumber, staffNumber)
        })
      } else if (tag === 'durationType') {
        pendingDurationType = child.textContent.trim()
      } else if (tag === 'dots') {
        pendingDots = parseInt(child.textContent, 10) || 0
      } else if (tag === 'Note') {
        pendingChord = pendingChord || []
        pendingChord.push(child)
      }
    })

    if (pendingChord) {
      pendingChord.forEach((noteEl, index) => {
        notes += noteXml(noteEl, pendingDurationType, pendingDots, index > 0, voiceNumber, staffNumber)
      })
    }

    firstVoice = false
  })

  const attrXml = attributes
    ? `<attributes><divisions>${DIVISIONS}</divisions>${staffNumber === 1 ? `<staves>${partStaffCount}</staves>` : ''}${attributes}</attributes>`
    : (staffNumber === 1 ? `<attributes><divisions>${DIVISIONS}</divisions><staves>${partStaffCount}</staves></attributes>` : '')

  return `<measure number="${measureEl.getAttribute('number') || ''}">${attrXml}${notes}</measure>`
}

export function museScoreToMusicXml(mscx, title = 'Partitur') {
  const parser = new DOMParser()
  const doc = parser.parseFromString(mscx, 'text/xml')
  if (doc.querySelector('parsererror')) {
    throw new Error('MuseScore-Datei konnte nicht gelesen werden.')
  }

  const score = doc.querySelector('Score')
  if (!score) {
    throw new Error('Kein Score in der MuseScore-Datei gefunden.')
  }

  const partDefs = childrenByTag(score, 'Part')
  const staffNodes = childrenByTag(score, 'Staff')
  const staffById = new Map(staffNodes.map((staff) => [staff.getAttribute('id'), staff]))

  if (partDefs.length === 0) {
    throw new Error('Keine Instrumente (Part) in der MuseScore-Datei gefunden.')
  }

  const scoreParts = []
  const parts = []

  partDefs.forEach((partEl, index) => {
    const partId = `P${index + 1}`
    const staffEls = childrenByTag(partEl, 'Staff')
    const staffIds = staffEls.map((el) => el.getAttribute('id')).filter(Boolean)
    const name = text(partEl, 'trackName')
      || text(partEl, 'Instrument longName')
      || text(partEl, 'longName')
      || `Instrument ${index + 1}`

    scoreParts.push(`<score-part id="${partId}"><part-name>${xmlEscape(name)}</part-name></score-part>`)

    const measuresByIndex = []
    staffIds.forEach((staffId, staffIndex) => {
      const staffNode = staffById.get(staffId)
      if (!staffNode) return
      const measures = childrenByTag(staffNode, 'Measure')
      measures.forEach((measure, measureIndex) => {
        if (!measuresByIndex[measureIndex]) measuresByIndex[measureIndex] = []
        measuresByIndex[measureIndex].push(
          convertMeasure(measure, staffIndex + 1, staffIds.length)
        )
      })
    })

    const mergedMeasures = measuresByIndex.map((measureXmls, measureIndex) => {
      const notes = measureXmls
        .map((xml) => xml.replace(/^<measure[^>]*>/, '').replace(/<\/measure>$/, ''))
        .join('')
      return `<measure number="${measureIndex + 1}">${notes}</measure>`
    }).join('')

    parts.push(`<part id="${partId}">${mergedMeasures || '<measure number="1"><attributes><divisions>240</divisions></attributes><note><rest measure="yes"/><duration>960</duration><voice>1</voice></note></measure>'}</part>`)
  })

  const workTitle = text(score, 'metaTag[name="workTitle"]')
    || text(doc, 'metaTag[name="workTitle"]')
    || title

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>${xmlEscape(workTitle)}</work-title></work>
  <part-list>
    ${scoreParts.join('\n    ')}
  </part-list>
  ${parts.join('\n  ')}
</score-partwise>`
}