import InstrumentItem from './InstrumentItem.jsx'

export function InstrumentList({ 
  instruments, 
  onInstrumentsChange, 
  onPresetSelect,
  generationStatus,
  errorInstruments = []
}) {
  /**
   * Einzelnes Instrument aktualisieren
   */
  const handleInstrumentChange = (updatedInstrument) => {
    if (!onInstrumentsChange) return;
    
    const updatedInstruments = instruments.map(instrument => 
      instrument.id === updatedInstrument.id ? updatedInstrument : instrument
    );
    
    onInstrumentsChange(updatedInstruments);
  };
  
  /**
   * Alle Instrumente auswählen/abwählen
   */
  const handleSelectAll = () => {
    if (!onInstrumentsChange) return;
    
    const allSelected = instruments.every(instr => instr.selected);
    const updatedInstruments = instruments.map(instrument => ({
      ...instrument,
      selected: !allSelected,
    }));
    
    onInstrumentsChange(updatedInstruments);
  };
  
  /**
   * Transposition für alle ausgewählten Instrumente setzen
   */
  const handleTransposeAllSelected = (semitones, label) => {
    if (!onInstrumentsChange) return;
    
    const updatedInstruments = instruments.map(instrument => 
      instrument.selected 
        ? { ...instrument, transpose: semitones }
        : instrument
    );
    
    onInstrumentsChange(updatedInstruments);
  };
  
  /**
   * Preset für ein bestimmtes Instrument setzen
   */
  const handleInstrumentPresetSelect = (instrumentId, semitones, label) => {
    if (onPresetSelect) {
      onPresetSelect(instrumentId, semitones, label);
    }
  };
  
  // Berechnungen
  const selectedCount = instruments.filter(instr => instr.selected).length;
  const totalCount = instruments.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  
  // Wenn keine Instrumente vorhanden
  if (!instruments || instruments.length === 0) {
    return (
      <div className="border border-gray-300 rounded-lg p-8 text-center bg-white">
        <div className="text-4xl mb-4">🎼</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Keine Instrumente gefunden
        </h3>
        <p className="text-gray-600">
          Bitte lade zuerst eine MuseScore-Datei (.mscz) hoch.
        </p>
      </div>
    );
  }
  
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header mit Kontrollelementen */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-black">
              Instrumente ({totalCount} gefunden)
            </h3>
            
            <span className="text-sm text-gray-700 bg-gray-200 px-2 py-1 rounded">
              {selectedCount} ausgewählt
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="btn-secondary text-sm px-4 py-2"
            >
              {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
            </button>
            
            <button
              type="button"
              onClick={() => handleTransposeAllSelected(0, 'Concert Pitch')}
              disabled={selectedCount === 0}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm
                       hover:bg-gray-50 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ausgewählte = 0
            </button>
          </div>
        </div>
        
        {/* Info-Text */}
        <div className="mt-3 text-sm text-gray-600">
          <p>
            Wähle die Instrumente aus, die transponiert werden sollen, und stelle die 
            Transposition (in Halbtönen) ein. Positive Zahlen erhöhen die Tonhöhe.
          </p>
        </div>
      </div>
      
      {/* Instrumente-Liste */}
      <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
        {instruments.map(instrument => {
          const isGenerating = generationStatus?.[instrument.id] === 'generating';
          const hasError = errorInstruments.includes(instrument.id);
          
          return (
            <InstrumentItem
              key={instrument.id}
              instrument={instrument}
              onChange={handleInstrumentChange}
              onPresetSelect={handleInstrumentPresetSelect}
              isGenerating={isGenerating}
              hasError={hasError}
            />
          );
        })}
      </div>
      
      {/* Footer mit zusätzlichen Aktionen */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            {selectedCount > 0 ? (
              <p>
                <span className="font-medium">{selectedCount} Instrumente</span> werden 
                transponiert und als PDF exportiert.
              </p>
            ) : (
              <p>Wähle mindestens ein Instrument für die Transposition aus.</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTransposeAllSelected(-2, 'Bb Instruments')}
              disabled={selectedCount === 0}
              className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm
                       hover:bg-gray-50 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ausgewählte = Bb
            </button>
            <button
              type="button"
              onClick={() => handleTransposeAllSelected(-3, 'Eb Instruments')}
              disabled={selectedCount === 0}
              className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm
                       hover:bg-gray-50 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ausgewählte = Eb
            </button>
            <button
              type="button"
              onClick={() => handleTransposeAllSelected(-5, 'F Instruments')}
              disabled={selectedCount === 0}
              className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm
                       hover:bg-gray-50 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ausgewählte = F
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstrumentList