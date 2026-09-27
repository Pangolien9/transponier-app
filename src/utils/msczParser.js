import JSZip from 'jszip'
import { isMuseScoreXml, isMusicXml, museScoreToMusicXml } from './mscxToMusicXml.js'

const MAX_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.mscz', '.mscx', '.musicxml', '.xml', '.mxl']

function extensionOf(name = '') {
  const lower = name.toLowerCase()
  const match = ALLOWED_EXTENSIONS.find((ext) => lower.endsWith(ext))
  return match || ''
}

function normalizeXml(xml, filename) {
  if (isMusicXml(xml)) return xml
  if (isMuseScoreXml(xml)) return museScoreToMusicXml(xml, filename)
  throw new Error('Die Datei enthält weder MusicXML noch MuseScore-XML.')
}

async function xmlFromZip(file, filename) {
  const zip = await JSZip.loadAsync(file)
  const names = Object.keys(zip.files)

  const mxlContainer = names.find((name) => name.toLowerCase().endsWith('container.xml'))
  if (mxlContainer) {
    const containerXml = await zip.file(mxlContainer).async('string')
    const rootfile = containerXml.match(/full-path="([^"]+)"/)?.[1]
    const target = rootfile && zip.file(rootfile)
    if (target) {
      return normalizeXml(await target.async('string'), filename)
    }
  }

  const preferred = names.find((name) => /\.(mscx|musicxml|xml)$/i.test(name) && !name.toLowerCase().includes('container'))
  if (!preferred) {
    throw new Error('Keine Notendatei (.mscx / MusicXML) im Archiv gefunden.')
  }
  return normalizeXml(await zip.file(preferred).async('string'), filename)
}

export async function parseMscz(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Datei ist zu groß (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximal 20 MB erlaubt.`)
  }

  const ext = extensionOf(file.name)
  if (!ext) {
    throw new Error('Bitte eine .mscz, .mscx, .musicxml, .xml oder .mxl Datei hochladen.')
  }

  try {
    if (ext === '.mscz' || ext === '.mxl') {
      return await xmlFromZip(file, file.name)
    }
    const xml = await file.text()
    return normalizeXml(xml, file.name)
  } catch (error) {
    if (error.message.includes('Corrupted zip') || error.message.includes('Invalid file')) {
      throw new Error('Die Datei ist beschädigt oder kein gültiges Archiv.')
    }
    throw new Error(error.message || 'Datei konnte nicht verarbeitet werden.')
  }
}

export async function validateMsczFile(file) {
  if (!file) return false
  if (!extensionOf(file.name)) return false
  if (file.size > MAX_FILE_SIZE || file.size < 20) return false
  return true
}

export async function getMsczMetadata(file) {
  return {
    filename: file.name,
    size: file.size,
    extension: extensionOf(file.name),
  }
}

export default {
  parseMscz,
  validateMsczFile,
  getMsczMetadata,
}