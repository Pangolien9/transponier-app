/**
 * Komponente für Transpositions-Presets
 * 
 * Zeigt vordefinierte Transpositions-Werte für verschiedene Instrument-Typen
 * 
 * @param {Object} props
 * @param {Function} props.onPresetSelect - Callback wenn Preset ausgewählt
 * @param {number} props.currentTranspose - Aktuelle Transposition (für Highlighting)
 */
export function TransposePresets({ onPresetSelect, currentTranspose }) {
  /**
   * Standard-Transpositions-Presets
   */
  const presets = [
    { value: 0, label: 'Concert Pitch', description: 'Kammerton (keine Transposition)', icon: '🎵' },
    { value: -2, label: 'Bb Instrumente', description: 'Klarinette, Trompete, Tenorsax', icon: '🎺' },
    { value: -3, label: 'Eb Instrumente', description: 'Altsax, Baritonsax', icon: '🎷' },
    { value: -5, label: 'F Instrumente', description: 'Horn in F', icon: '🎶' },
    { value: 12, label: 'Piccolo (+1 Oktave)', description: 'Piccolo', icon: '🎼' },
    { value: -12, label: '-1 Oktave', description: 'Eine Oktave tiefer', icon: '🔽' },
  ];
  
  /**
   * Benutzerdefinierte Presets (können später erweitert werden)
   */
  const customPresets = [
    { value: -1, label: '-1 Halbton', icon: '🔻' },
    { value: 1, label: '+1 Halbton', icon: '🔺' },
    { value: -7, label: 'Quinte runter', description: 'z.B. für spezielle Arrangements', icon: '⬇️' },
    { value: 7, label: 'Quinte hoch', description: 'z.B. für spezielle Arrangements', icon: '⬆️' },
  ];
  
  /**
   * Preset auswählen
   */
  const handlePresetClick = (value, label) => {
    if (onPresetSelect) {
      onPresetSelect(value, label);
    }
  };
  
  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
        <span className="text-xl">🎛️</span>
        Transpositions-Presets
      </h3>
      
      <p className="text-gray-600 mb-6 text-sm">
        Schnelle Auswahl für gängige Transpositionen. Klicke auf ein Preset um die 
        Transposition für alle ausgewählten Instrumente zu setzen.
      </p>
      
      {/* Standard-Presets */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          Häufige Transpositionen
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {presets.map(preset => {
            const isActive = currentTranspose === preset.value;
            
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePresetClick(preset.value, preset.label)}
                className={`border rounded-lg p-4 text-left transition-colors
                          ${isActive 
                            ? 'bg-black text-white border-black' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{preset.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{preset.label}</div>
                    <div className={`text-sm mt-1 ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                      {preset.description}
                    </div>
                    <div className={`text-xs mt-2 ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                      {preset.value > 0 ? '+' : ''}{preset.value} Halbtöne
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Benutzerdefinierte Presets */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-lg">🎨</span>
          Weitere Optionen
        </h4>
        
        <div className="flex flex-wrap gap-2">
          {customPresets.map(preset => {
            const isActive = currentTranspose === preset.value;
            
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePresetClick(preset.value, preset.label)}
                className={`border rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors whitespace-nowrap
                          ${isActive 
                            ? 'bg-black text-white border-black' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
              >
                <span>{preset.icon}</span>
                <span className="font-medium">{preset.label}</span>
              </button>
            );
          })}

        </div>
      </div>
      
      {/* Erklärung */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="text-sm text-gray-600 space-y-3">
          <div>
            <div className="font-medium text-gray-800 mb-1">Manuelle Eingabe</div>
            <p>Wähle im Dropdown neben jedem Instrument individuell von -12 bis +12 Halbtöne.</p>
          </div>
          <div>
            <p><span className="font-medium text-gray-800">Positive Zahlen:</span> Erhöhen die Tonhöhe</p>
            <p><span className="font-medium text-gray-800">Negative Zahlen:</span> Verringern die Tonhöhe</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransposePresets;