import { useRef, useState } from 'react'

const ACCEPT = '.mscz,.mscx,.musicxml,.xml,.mxl'

export function FileUpload({ onFileSelect, isLoading, currentFilename, onReset }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file && onFileSelect) onFileSelect(file)
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
    if (file && onFileSelect) onFileSelect(file)
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
        <input ref={fileInputRef} type="file" accept={ACCEPT} onChange={handleFileSelect} className="hidden" />
      </div>
    )
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${isDragActive ? 'dropzone-active' : 'dropzone-inactive'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={isLoading ? undefined : handleButtonClick}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input ref={fileInputRef} type="file" accept={ACCEPT} onChange={handleFileSelect} className="hidden" />
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
      </div>
    </div>
  )
}

export default FileUpload