import { useState } from 'react'
import Header from './components/Header.jsx'
import FileUpload from './components/FileUpload.jsx'
import InstrumentList from './components/InstrumentList.jsx'
import TransposePresets from './components/TransposePresets.jsx'
import OutputPanel from './components/OutputPanel.jsx'
import { parseMscz, validateMsczFile } from './utils/msczParser.js'
import { detectInstruments } from './utils/instrumentDetector.js'
import { extractPartScore, isValidTransposition, transposeMusic } from './utils/transposer.js'
import { generatePDF, createPDFFilename } from './utils/pdfGenerator.js'
import { downloadPDF, downloadAllAsZip } from './utils/fileHelpers.js'

function App() {
  const [fullScoreXml, setFullScoreXml] = useState(null)
  const [currentFilename, setCurrentFilename] = useState(null)
  const [instruments, setInstruments] = useState([])
  const [generatedPDFs, setGeneratedPDFs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState({})
  const [error, setError] = useState(null)
  const [errorInstruments, setErrorInstruments] = useState([])

  const handleFileSelect = async (file) => {
    try {
      setIsLoading(true)
      setError(null)
      setLoadingStep('Validierung...')

      const isValid = await validateMsczFile(file)
      if (!isValid) {
        throw new Error('Bitte eine .mscz, .mscx, .musicxml, .xml oder .mxl Datei hochladen.')
      }

      setCurrentFilename(file.name)
      setLoadingStep('Datei wird analysiert...')
      const musicXml = await parseMscz(file)

      setLoadingStep('Instrumente werden erkannt...')
      const detected = detectInstruments(musicXml)

      setFullScoreXml(musicXml)
      setInstruments(detected.map((instr) => ({ ...instr, selected: true, transpose: 0 })))
      setGeneratedPDFs([])
      setGenerationStatus({})
      setErrorInstruments([])
    } catch (err) {
      setError(err.message)
      setFullScoreXml(null)
      setCurrentFilename(null)
      setInstruments([])
    } finally {
      setIsLoading(false)
      setLoadingStep('')
    }
  }

  const handleReset = () => {
    setFullScoreXml(null)
    setCurrentFilename(null)
    setInstruments([])
    setGeneratedPDFs([])
    setError(null)
    setGenerationProgress(0)
    setGenerationStatus({})
    setErrorInstruments([])
    setIsLoading(false)
    setLoadingStep('')
  }

  const handlePresetSelect = (semitones) => {
    if (!isValidTransposition(semitones)) return
    setInstruments((prev) => prev.map((instrument) => (
      instrument.selected ? { ...instrument, transpose: semitones } : instrument
    )))
  }

  const handleInstrumentPresetSelect = (instrumentId, semitones) => {
    if (!isValidTransposition(semitones)) return
    setInstruments((prev) => prev.map((instrument) => (
      instrument.id === instrumentId ? { ...instrument, transpose: semitones } : instrument
    )))
  }

  const handleGeneratePDFs = async () => {
    const selected = instruments.filter((instr) => instr.selected)
    if (selected.length === 0) {
      setError('Bitte wähle mindestens ein Instrument aus.')
      return
    }
    if (!fullScoreXml) {
      setError('Keine Partitur geladen.')
      return
    }

    const failed = []
    setIsLoading(true)
    setError(null)
    setGeneratedPDFs([])
    setErrorInstruments([])
    setGenerationStatus(Object.fromEntries(selected.map((instr) => [instr.id, 'pending'])))

    const results = []
    for (let i = 0; i < selected.length; i += 1) {
      const instrument = selected[i]
      try {
        setGenerationStatus((prev) => ({ ...prev, [instrument.id]: 'generating' }))
        setLoadingStep(`Transponiere ${instrument.name}...`)
        const partXml = extractPartScore(fullScoreXml, instrument.id, instrument.name)
        const transposedXml = transposeMusic(partXml, instrument.transpose)
        setLoadingStep(`PDF für ${instrument.name}...`)
        const blob = await generatePDF(transposedXml, instrument.name)
        results.push({
          name: instrument.name,
          transpose: instrument.transpose,
          success: true,
          blob,
          filename: createPDFFilename(instrument.name, instrument.transpose),
        })
        setGenerationStatus((prev) => ({ ...prev, [instrument.id]: 'success' }))
      } catch (err) {
        failed.push(instrument.id)
        results.push({
          name: instrument.name,
          transpose: instrument.transpose,
          success: false,
          error: err.message,
          blob: null,
        })
        setGenerationStatus((prev) => ({ ...prev, [instrument.id]: 'error' }))
      }
      setGenerationProgress(((i + 1) / selected.length) * 100)
    }

    setGeneratedPDFs(results)
    setErrorInstruments(failed)
    setIsLoading(false)
    setLoadingStep('')
    setGenerationProgress(0)
  }

  const handleDownloadPDF = (index) => {
    const pdf = generatedPDFs[index]
    if (!pdf?.success || !pdf.blob) return
    downloadPDF(pdf.blob, pdf.name, pdf.transpose)
  }

  const handleDownloadAllPDFs = async () => {
    try {
      const successful = generatedPDFs.filter((pdf) => pdf.success && pdf.blob)
      if (successful.length === 0) {
        throw new Error('Keine erfolgreich generierten PDFs zum Download verfügbar.')
      }
      await downloadAllAsZip(successful, currentFilename || 'transponiert')
    } catch (err) {
      setError(err.message)
    }
  }

  const selectedCount = instruments.filter((instr) => instr.selected).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container-custom py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-xl">!</div>
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Fehler</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button onClick={() => setError(null)} className="mt-2 text-sm text-red-600 hover:text-red-800">
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">1. Datei hochladen</h2>
          <FileUpload
            onFileSelect={handleFileSelect}
            isLoading={isLoading && !generatedPDFs.length}
            currentFilename={currentFilename}
            onReset={handleReset}
          />
        </section>

        {instruments.length > 0 && (
          <>
            <section className="mb-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                  <h2 className="text-xl font-semibold text-black mb-4">2. Instrumente auswählen & transponieren</h2>
                  <InstrumentList
                    instruments={instruments}
                    onInstrumentsChange={setInstruments}
                    onPresetSelect={handleInstrumentPresetSelect}
                    generationStatus={generationStatus}
                    errorInstruments={errorInstruments}
                  />
                </div>
                <div className="lg:w-1/3">
                  <h2 className="text-xl font-semibold text-black mb-4">Schnell-Transposition</h2>
                  <TransposePresets onPresetSelect={handlePresetSelect} currentTranspose={0} />
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-gray-300 rounded-lg bg-white">
                <div>
                  <h3 className="font-semibold text-black">Bereit zur Transposition</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedCount} Instrument{selectedCount === 1 ? '' : 'e'} ausgewählt
                  </p>
                </div>
                <button
                  onClick={handleGeneratePDFs}
                  disabled={isLoading || selectedCount === 0}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="spinner" />
                      {loadingStep || 'Wird verarbeitet...'}
                    </span>
                  ) : 'PDFs generieren'}
                </button>
              </div>
            </section>
          </>
        )}

        {(generatedPDFs.length > 0 || (isLoading && loadingStep.includes('PDF'))) && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black mb-4">3. PDFs herunterladen</h2>
            <OutputPanel
              generatedPDFs={generatedPDFs}
              onDownload={handleDownloadPDF}
              onDownloadAll={handleDownloadAllPDFs}
              isGenerating={isLoading && generatedPDFs.length === 0}
              generationProgress={generationProgress}
              originalFilename={currentFilename}
              errorInstruments={errorInstruments}
            />
          </section>
        )}

        <div className="mt-12 pt-8 border-t border-gray-300 text-center text-gray-600 text-sm">
          <h3 className="font-semibold text-black mb-3">Ablauf</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4">
              <div className="font-medium mb-1">Datei hochladen</div>
              <p>.mscz, .mscx, .musicxml oder .mxl</p>
            </div>
            <div className="p-4">
              <div className="font-medium mb-1">Instrumente wählen</div>
              <p>Stimmen einzeln auswählen</p>
            </div>
            <div className="p-4">
              <div className="font-medium mb-1">Transponieren</div>
              <p>-12 bis +12 Halbtöne</p>
            </div>
            <div className="p-4">
              <div className="font-medium mb-1">PDFs herunterladen</div>
              <p>einzeln oder als ZIP</p>
            </div>
          </div>
          <p className="mt-8 text-gray-500 text-xs">
            Alles läuft lokal im Browser. Keine Datei verlässt dein Gerät.
          </p>
        </div>
      </main>

      <footer className="bg-black text-white py-6 mt-8">
        <div className="container-custom text-center">
          <p className="mb-2">Transponier-App</p>
          <p className="text-gray-400 text-sm">100% client-seitig</p>
        </div>
      </footer>
    </div>
  )
}

export default App