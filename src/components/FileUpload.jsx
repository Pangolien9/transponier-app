import { useRef, useState } from 'react'

const ACCEPT = '.mscz,.mscx,.musicxml,.xml,.mxl'
const ACCEPT_ALL = '.mscz,.mscx,.musicxml,.xml,.mxl,.pdf'

export function FileUpload({ onFileSelect, isLoading, currentFilename, onReset }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const fileInputRef = useRef(null)

  const isPdfFile = (file) => {
    return file && file.type === 'application/pdf'
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (isPdfFile(file)) {
        setShowPdfModal(true)
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else if (onFileSelect) {
        onFileSelect(file)
      }
    }
  }

  const handleDrag = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.type === 'dragenter' || event.type === 'dragover') setIsDragActive(true)
    else if (event.type === 'dragleave') setIsDragActive(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      if (isPdfFile(file)) {
        setShowPdfModal(true)
      } else if (onFileSelect) {
        onFileSelect(file)
      }
    }
  }

  const handleButtonClick = (event) => {
    event.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleReset = () => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    onReset?.()
  }

  if (currentFilename) {
    return (
      <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium text-black">{currentFilename}</p>
            <p className="text-sm text-gray-600 mt-1">Datei erfolgreich geladen</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleButtonClick} disabled={isLoading} className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">
              Neue Datei
            </button>
            <button onClick={handleReset} disabled={isLoading} className="border border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
              Zurücksetzen
            </button>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept={ACCEPT_ALL} onChange={handleFileSelect} className="hidden" />
      </div>
    )
  }

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${isDragActive ? 'dropzone-active' : 'dropzone-inactive'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={isLoading ? undefined : handleButtonClick}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept={ACCEPT_ALL} onChange={handleFileSelect} className="hidden" />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-black mb-2">
            {isDragActive ? 'Datei hier ablegen' : 'Notendatei hochladen'}
          </h3>
          <p className="text-gray-600 mb-6">
            Drag & Drop oder klicken. Unterstützt .mscz, .mscx, .musicxml, .xml und .mxl
          </p>
          <button type="button" onClick={handleButtonClick} disabled={isLoading} className="btn-primary disabled:opacity-50">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="spinner" />
                Wird verarbeitet...
              </span>
            ) : 'Datei auswählen'}
          </button>
          
          {/* PDF Hinweis */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={(e) => { e.stopPropagation(); setShowPdfModal(true); }}
              className="text-sm text-gray-600 hover:text-black underline"
            >
              📄 Hast du eine PDF-Datei? Klicke hier für Konvertierungs-Optionen
            </button>
          </div>
        </div>
      </div>

      {/* PDF Konvertierungs-Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowPdfModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-black">PDF-Dateien konvertieren</h2>
              <button onClick={() => setShowPdfModal(false)} className="text-gray-500 hover:text-black text-2xl leading-none">
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                PDFs enthalten nur Bilder von Noten, keine musikalischen Daten. Um sie zu transponieren, 
                müssen sie zuerst in MusicXML konvertiert werden.
              </p>
            </div>

            {/* Option 1: Online-Konverter */}
            <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">🌐</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-black mb-2">Option 1: Online-Konverter (Empfohlen)</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Schnell und einfach - keine Installation nötig. Nutze einen dieser kostenlosen Online-Dienste:
                  </p>
                  
                  <div className="space-y-2">
                    <a
                      href="https://homr.site"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white border border-gray-300 rounded hover:border-black transition-colors"
                    >
                      <div className="font-medium text-black">homr.site ⭐ Empfohlen</div>
                      <div className="text-sm text-gray-600">Modernster OCR-Algorithmus, beste Ergebnisse</div>
                    </a>
                    
                    <a
                      href="https://musescore.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white border border-gray-300 rounded hover:border-black transition-colors"
                    >
                      <div className="font-medium text-black">musescore.com</div>
                      <div className="text-sm text-gray-600">Kostenloser Account erforderlich</div>
                    </a>
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-900">
                      <strong>Anleitung:</strong> PDF hochladen → Warten (1-3 Min) → MusicXML herunterladen → Hier in der App hochladen
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: Desktop-Software */}
            <div className="mb-6 p-4 border border-gray-300 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💻</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-black mb-2">Option 2: Desktop-Software</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Für häufige Konvertierungen - einmalige Installation, dann offline nutzbar:
                  </p>
                  
                  <a
                    href="https://musescore.org/de/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-white border border-gray-300 rounded hover:border-black transition-colors"
                  >
                    <div className="font-medium text-black">MuseScore (kostenlos)</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Windows, Mac, Linux • Vollständige Notensatz-Software mit PDF-Import
                    </div>
                  </a>

                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-900">
                      <strong>Anleitung:</strong> MuseScore installieren → Datei → Öffnen → PDF auswählen → 
                      Datei → Exportieren → MusicXML → Hier hochladen
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wichtige Hinweise */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold text-black mb-2">⚠️ Wichtige Hinweise</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>OCR (Optische Notenerkennung) ist nicht perfekt - prüfe das Ergebnis</li>
                <li>Beste Ergebnisse mit sauberen, gedruckten Noten</li>
                <li>Handgeschriebene oder alte Noten können Fehler enthalten</li>
                <li>Mehrseitige PDFs: Jede Seite wird einzeln verarbeitet</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPdfModal(false)}
                className="btn-primary"
              >
                Verstanden
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FileUpload