import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import { jsPDF } from 'jspdf'
import { svg2pdf } from 'svg2pdf.js'
import { PDF_SETTINGS } from '../config/features.js'

function waitForPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
}

function pageSizeMm() {
  if (PDF_SETTINGS.pageFormat === 'letter') {
    return PDF_SETTINGS.orientation === 'landscape' ? [279.4, 215.9] : [215.9, 279.4]
  }
  return PDF_SETTINGS.orientation === 'landscape' ? [297, 210] : [210, 297]
}

export async function generatePDF(musicXml, instrumentName) {
  if (typeof document === 'undefined') {
    throw new Error('PDF-Generierung ist nur im Browser möglich.')
  }

  const [pageWidth, pageHeight] = pageSizeMm()
  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:900px;background:#fff;'
  document.body.appendChild(container)

  try {
    const osmd = new OpenSheetMusicDisplay(container, {
      autoResize: false,
      backend: 'svg',
      drawTitle: true,
      drawSubtitle: false,
      drawComposer: true,
      drawPartNames: true,
      drawMeasureNumbers: true,
      pageFormat: PDF_SETTINGS.pageFormat === 'letter' ? 'Letter_P' : 'A4_P',
    })

    await osmd.load(musicXml)
    osmd.zoom = 0.8
    osmd.render()
    await waitForPaint()

    const svgPages = [...container.querySelectorAll('svg')]
    if (svgPages.length === 0) {
      throw new Error('Kein Notenbild nach dem Rendering gefunden.')
    }

    const pdf = new jsPDF({
      orientation: PDF_SETTINGS.orientation,
      unit: 'mm',
      format: PDF_SETTINGS.pageFormat,
    })

    const usableWidth = pageWidth - PDF_SETTINGS.margins.left - PDF_SETTINGS.margins.right
    const usableHeight = pageHeight - PDF_SETTINGS.margins.top - PDF_SETTINGS.margins.bottom

    for (let i = 0; i < svgPages.length; i += 1) {
      if (i > 0) pdf.addPage()
      const svg = svgPages[i]
      const bbox = svg.getBBox()
      const width = Number(svg.getAttribute('width')) || bbox.width || 900
      const height = Number(svg.getAttribute('height')) || bbox.height || 1200
      const scale = Math.min(usableWidth / width, usableHeight / height, 1)
      await svg2pdf(svg, pdf, {
        x: PDF_SETTINGS.margins.left,
        y: PDF_SETTINGS.margins.top,
        width: width * scale,
        height: height * scale,
      })
    }

    pdf.setProperties({
      title: `Transponiert: ${instrumentName}`,
      subject: 'Transponierte Noten',
      author: 'Transponier-App',
      creator: 'Transponier-App',
    })

    return pdf.output('blob')
  } catch (error) {
    throw new Error(`PDF-Generierung fehlgeschlagen: ${error.message}`)
  } finally {
    container.remove()
  }
}

export async function generateMultiplePDFs(instruments, onProgress) {
  const results = []
  for (let i = 0; i < instruments.length; i += 1) {
    const instrument = instruments[i]
    onProgress?.(i, instruments.length, instrument)
    try {
      const blob = await generatePDF(instrument.xml, instrument.name)
      results.push({
        blob,
        name: instrument.name,
        transpose: instrument.transpose,
        index: i,
        success: true,
      })
    } catch (error) {
      results.push({
        blob: null,
        name: instrument.name,
        transpose: instrument.transpose,
        index: i,
        success: false,
        error: error.message,
      })
    }
  }
  return results
}

export function createPDFFilename(instrumentName, transpose) {
  const safeName = instrumentName
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-_]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 30) || 'Instrument'
  const transposeText = transpose === 0 ? '' : `_${transpose > 0 ? '+' : ''}${transpose}_Halbtoene`
  return `${safeName}${transposeText}.pdf`
}

export default {
  generatePDF,
  generateMultiplePDFs,
  createPDFFilename,
}