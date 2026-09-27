export function InstrumentItem({ 
  instrument, 
  onChange, 
  onPresetSelect,
  isGenerating,
  hasError 
}) {
  /**
   * Checkbox-Änderung behandeln
   */
  const handleCheckboxChange = (event) => {
    if (onChange) {
      onChange({
        ...instrument,
        selected: event.target.checked,
      });
    }
  };
  
  /**
   * Transposition-Änderung behandeln
   */
  const handleTransposeChange = (event) => {
    const newTranspose = parseInt(event.target.value);
    if (onChange && !isNaN(newTranspose)) {
      onChange({
        ...instrument,
        transpose: newTranspose,
      });
    }
  };
  
  /**
   * Preset-Button klicken
   */
  const handlePresetClick = (semitones, label) => {
    if (onPresetSelect) {
      onPresetSelect(instrument.id, semitones, label);
    }
  };
  
  // Status-Indikatoren
  const statusClass = isGenerating 
    ? 'opacity-70 border-l-4 border-yellow-500' 
    : hasError 
      ? 'border-l-4 border-red-500 bg-red-50' 
      : 'border-l-2 border-gray-200';
  
  return (
    <div className={`px-6 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${statusClass}`}>
      {/* Checkbox für Auswahl */}
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          id={`instrument-${instrument.id}`}
          checked={instrument.selected}
          onChange={handleCheckboxChange}
          disabled={isGenerating}
          className="w-5 h-5 rounded border-gray-300 text-black 
                   focus:ring-black focus:ring-2 focus:ring-offset-0
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      
      {/* Instrument-Name */}
      <div className="flex-1 min-w-0">
        <label 
          htmlFor={`instrument-${instrument.id}`}
          className="font-medium text-black cursor-pointer hover:text-gray-800"
        >
          {instrument.name}
          {instrument.transpose !== 0 && (
            <span className="ml-2 text-sm text-gray-600">
              ({instrument.transpose > 0 ? '+' : ''}{instrument.transpose} Halbtöne)
            </span>
          )}
        </label>
        
        {/* Status-Anzeige */}
        <div className="text-sm text-gray-500 mt-1">
          {isGenerating && (
            <span className="flex items-center gap-1 text-yellow-600">
              <div className="spinner w-3 h-3"></div>
              PDF wird generiert...
            </span>
          )}
          {hasError && (
            <span className="text-red-600">
              Fehler bei der Generierung
            </span>
          )}
        </div>
      </div>
      
      {/* Transpositions-Auswahl */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
        {/* Schnelle Presets */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handlePresetClick(0, 'Concert')}
            className={`px-2 py-1 text-xs rounded border 
                       ${instrument.transpose === 0 
                         ? 'bg-black text-white border-black' 
                         : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            disabled={isGenerating}
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick(-2, 'Bb')}
            className={`px-2 py-1 text-xs rounded border
                       ${instrument.transpose === -2 
                         ? 'bg-black text-white border-black' 
                         : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            disabled={isGenerating}
          >
            Bb
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick(-3, 'Eb')}
            className={`px-2 py-1 text-xs rounded border
                       ${instrument.transpose === -3 
                         ? 'bg-black text-white border-black' 
                         : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            disabled={isGenerating}
          >
            Eb
          </button>
        </div>
        
        {/* Detaillierte Transposition */}
        <div className="flex items-center gap-2">
          <label htmlFor={`transpose-${instrument.id}`} className="text-sm text-gray-700 whitespace-nowrap">
            Halbtöne:
          </label>
          <select
            id={`transpose-${instrument.id}`}
            value={instrument.transpose}
            onChange={handleTransposeChange}
            disabled={isGenerating}
            className="border border-gray-300 rounded-lg text-sm py-1 px-2 w-24
                     bg-white focus:ring-2 focus:ring-black focus:border-black
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Array.from({ length: 25 }, (_, i) => i - 12).map(value => (
              <option key={value} value={value}>
                {value > 0 ? '+' : ''}{value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default InstrumentItem;