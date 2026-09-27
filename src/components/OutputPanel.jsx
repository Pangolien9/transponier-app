/**
 * Output-Panel für generierte PDFs
 * 
 * Zeigt die generierten PDFs an und bietet Download-Optionen
 * 
 * @param {Object} props
 * @param {Array<Object>} props.generatedPDFs - Array von generierten PDFs
 * @param {Function} props.onDownload - Callback für Einzel-Download
 * @param {Function} props.onDownloadAll - Callback für ZIP-Download aller PDFs
 * @param {boolean} props.isGenerating - Läuft gerade PDF-Generierung?
 * @param {number} props.generationProgress - Fortschritt der Generierung (0-100)
 * @param {string} props.originalFilename - Original-Dateiname für ZIP
 * @param {Array<string>} props.errorInstruments - IDs von Instrumenten mit Fehlern
 */
export function OutputPanel({ 
  generatedPDFs = [],
  onDownload,
  onDownloadAll,
  isGenerating,
  generationProgress = 0,
  originalFilename = 'transponiert',
  errorInstruments = []
}) {
  /**
   * Einzelne PDF herunterladen
   */
  const handleDownload = (index) => {
    if (onDownload && generatedPDFs[index]) {
      onDownload(index);
    }
  };
  
  /**
   * Alle PDFs als ZIP herunterladen
   */
  const handleDownloadAll = () => {
    if (onDownloadAll) {
      onDownloadAll();
    }
  };
  
  // Berechnungen
  const totalPDFs = generatedPDFs.length;
  const successfulPDFs = generatedPDFs.filter(pdf => pdf.success).length;
  const failedPDFs = totalPDFs - successfulPDFs;
  
  // Wenn gerade generiert wird
  if (isGenerating) {
    return (
      <div className="border border-gray-300 rounded-lg p-8 bg-white shadow-sm">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          
          <h3 className="text-xl font-semibold text-black mb-4">
            PDFs werden generiert...
          </h3>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Fortschritt:</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-black h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Status-Infos */}
          <div className="text-gray-600 text-sm">
            <p className="mb-2">
              Je nach Größe der Datei und Anzahl der Instrumente kann dies einige Sekunden dauern.
            </p>
            <p className="text-gray-500">
              Bitte schließe diese Seite nicht während der Generierung.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Wenn keine PDFs vorhanden sind
  if (totalPDFs === 0) {
    return (
      <div className="border border-gray-300 rounded-lg p-8 text-center bg-white">
        <div className="text-4xl mb-4">📄</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Noch keine PDFs generiert
        </h3>
        <p className="text-gray-600">
          Wähle Instrumente aus und klicke auf "PDFs generieren" um mit der Transposition zu beginnen.
        </p>
      </div>
    );
  }
  
  // Wenn PDFs vorhanden sind
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📄</div>
            <div>
              <h3 className="text-lg font-semibold text-black">
                Generierte PDFs
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-700 mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {successfulPDFs} erfolgreich
                </span>
                {failedPDFs > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {failedPDFs} fehlgeschlagen
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={successfulPDFs === 0}
              className="btn-primary text-sm px-4 py-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Alle als ZIP herunterladen
            </button>
          </div>
        </div>
      </div>
      
      {/* PDF-Liste */}
      <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
        {generatedPDFs.map((pdf, index) => (
          <div 
            key={index}
            className={`px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                       ${!pdf.success ? 'bg-red-50' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className={`text-xl ${pdf.success ? 'text-green-600' : 'text-red-600'}`}>
                  {pdf.success ? '✅' : '❌'}
                </div>
                
                <div>
                  <div className="font-medium text-black">
                    {pdf.name}
                    {pdf.transpose !== 0 && (
                      <span className="ml-2 text-sm text-gray-600">
                        ({pdf.transpose > 0 ? '+' : ''}{pdf.transpose} Halbtöne)
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-1">
                    {pdf.success ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Erfolgreich generiert
                      </span>
                    ) : (
                      <span className="text-red-600">
                        {pdf.error || 'Generierung fehlgeschlagen'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              {pdf.success && pdf.blob && (
                <button
                  type="button"
                  onClick={() => handleDownload(index)}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Herunterladen
                </button>
              )}
              
              {!pdf.success && (
                <span className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded">
                  Nicht verfügbar
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer mit zusätzlichen Infos */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            <p>
              Alle PDFs wurden lokal generiert. Keine Daten haben dein Gerät verlassen.
            </p>
            {failedPDFs > 0 && (
              <p className="text-red-600 mt-1">
                Einige Instrumente konnten nicht generiert werden. Prüfe die Fehlermeldungen oben.
              </p>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Gesamt: {totalPDFs} PDFs</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutputPanel;