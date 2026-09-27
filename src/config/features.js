/**
 * Konfiguration für die Transponier-App
 * Diese Datei enthält Feature-Flags für zukünftige Erweiterungen
 */

export const FEATURES = {
  // Feature-Flags
  audioPreview: false,      // Audio-Vorschau (später hinzufügen)
  pdfPreview: false,       // PDF-Vorschau im Browser
  darkMode: false,         // Dark Mode UI
  batchProcessing: false,  // Batch-Verarbeitung mehrerer Dateien
  customPresets: true,     // Benutzerdefinierte Transpositions-Presets
  autoTranspose: false,    // Automatische Transposition basierend auf Instrument-Typ
};

/**
 * Standard-Transpositions für verschiedene Instrument-Typen
 * Wird in TransposePresets.jsx verwendet
 */
export const INSTRUMENT_TRANSPOSITIONS = {
  // Standard-Presets (Halbtöne)
  concertPitch: 0,        // Kammerton
  bFlat: -2,              // Bb-Instrumente (Klarinette, Trompete, Tenorsax)
  eFlat: -3,              // Eb-Instrumente (Altsax, Baritonsax)
  fHorn: -5,              // Horn in F
  aClarinet: -3,          // Klarinette in A
  piccolo: 12,            // Piccolo (+1 Oktave)
};

/**
 * UI-Einstellungen
 */
export const UI_SETTINGS = {
  maxFileSizeMB: 20,       // Maximale Dateigröße in MB
  maxInstruments: 50,      // Maximale Anzahl an Instrumenten
  defaultTransposeRange: 12, // Standard Transpositions-Bereich (±12 Halbtöne)
};

/**
 * PDF-Einstellungen
 */
export const PDF_SETTINGS = {
  pageFormat: 'a4',        // 'a4' oder 'letter'
  orientation: 'portrait', // 'portrait' oder 'landscape'
  dpi: 300,               // Qualität in DPI
  margins: {
    top: 10,              // in mm
    right: 10,
    bottom: 10,
    left: 10,
  },
};

/**
 * Instrument-Namen Standardisierung
 * Kann später erweitert werden für deutsche Übersetzungen
 */
export const INSTRUMENT_NAMES = {
  fallback: "Instrument", // Fallback-Name wenn kein Name vorhanden
};

export default {
  FEATURES,
  INSTRUMENT_TRANSPOSITIONS,
  UI_SETTINGS,
  PDF_SETTINGS,
  INSTRUMENT_NAMES,
};