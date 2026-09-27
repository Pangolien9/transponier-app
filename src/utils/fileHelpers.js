/**
 * File-Helper für Downloads und ZIP-Erstellung
 * 
 * @module fileHelpers
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Lädt eine Datei herunter (iOS/Android kompatibel)
 * 
 * @param {Blob} blob - Datei-Inhalt als Blob
 * @param {string} filename - Dateiname mit Extension
 */
export function downloadFile(blob, filename) {
  try {
    if (!blob || !(blob instanceof Blob)) {
      throw new Error('Ungültige Blob-Datei');
    }
    
    // FileSaver.js verwenden (kompatibel mit iOS Safari)
    saveAs(blob, filename);
    
  } catch (error) {
    console.error('Download-Fehler:', error);
    
    // Fallback für ältere Browser oder wenn FileSaver nicht funktioniert
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (fallbackError) {
      console.error('Fallback-Download fehlgeschlagen:', fallbackError);
      throw new Error(`Download nicht möglich: ${error.message}`);
    }
  }
}

/**
 * Erstellt ZIP mit mehreren PDFs
 * 
 * @param {Array<{blob: Blob, name: string, transpose: number}>} files - PDFs
 * @param {string} baseFilename - Basis-Dateiname für das ZIP
 * @returns {Promise<Blob>} - ZIP als Blob
 */
export async function createZip(files, baseFilename = 'transponiert') {
  try {
    // Prüfen ob files ein Array ist
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Keine Dateien für ZIP vorhanden');
    }
    
    // Nur erfolgreiche PDFs mit Blob verwenden
    const validFiles = files.filter(file => file.blob instanceof Blob);
    
    if (validFiles.length === 0) {
      throw new Error('Keine gültigen PDFs für ZIP vorhanden');
    }
    
    const zip = new JSZip();
    
    // Jede Datei zum ZIP hinzufügen
    for (const file of validFiles) {
      const safeName = file.name
        .replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-_]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      
      const transposeText = file.transpose === 0 ? '' : `_${file.transpose > 0 ? '+' : ''}${file.transpose}_Halbtoene`;
      const filename = `${safeName}${transposeText}.pdf`;
      
      // Blob als ArrayBuffer lesen und hinzufügen
      const arrayBuffer = await file.blob.arrayBuffer();
      zip.file(filename, arrayBuffer);
    }
    
    // ZIP generieren
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6, // Mittlere Komprimierung
      },
    });
    
    return zipBlob;
    
  } catch (error) {
    throw new Error(`ZIP-Erstellung fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Lädt eine einzelne PDF-Datei herunter
 * 
 * @param {Blob} pdfBlob - PDF als Blob
 * @param {string} instrumentName - Instrumenten-Name
 * @param {number} transpose - Transposition in Halbtönen
 */
export function downloadPDF(pdfBlob, instrumentName, transpose) {
  try {
    const safeName = instrumentName
      .replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-_]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 30); // Maximale Länge
    
    const transposeText = transpose === 0 ? '' : `_${transpose > 0 ? '+' : ''}${transpose}_Halbtoene`;
    const filename = `${safeName}${transposeText}.pdf`;
    
    downloadFile(pdfBlob, filename);
  } catch (error) {
    throw new Error(`PDF-Download fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Lädt alle PDFs als ZIP herunter
 * 
 * @param {Array<{blob: Blob, name: string, transpose: number}>} pdfs - Array von PDFs
 * @param {string} originalFilename - Original-Dateiname für ZIP-Namen
 */
export async function downloadAllAsZip(pdfs, originalFilename = 'transponiert') {
  try {
    // ZIP erstellen
    const zipBlob = await createZip(pdfs, originalFilename);
    
    // ZIP-Dateiname erstellen
    const safeOriginalName = originalFilename
      .replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-_]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const zipFilename = `${safeOriginalName}_transponiert_${timestamp}.zip`;
    
    // ZIP herunterladen
    downloadFile(zipBlob, zipFilename);
    
    return zipFilename;
  } catch (error) {
    throw new Error(`ZIP-Download fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Erstellt einen Download-Link für eine Datei (für UI-Komponenten)
 * 
 * @param {Blob} blob - Datei als Blob
 * @param {string} filename - Dateiname
 * @returns {string} - Object URL für den Link
 */
export function createDownloadLink(blob, filename) {
  try {
    const url = URL.createObjectURL(blob);
    
    // Cleanup-Funktion (optional)
    const cleanup = () => {
      URL.revokeObjectURL(url);
    };
    
    // Nach 5 Minuten automatisch cleanup
    setTimeout(cleanup, 5 * 60 * 1000);
    
    return url;
  } catch (error) {
    console.error('Download-Link Erstellung fehlgeschlagen:', error);
    return null;
  }
}

/**
 * Prüft, ob File API verfügbar ist
 * 
 * @returns {boolean} - True wenn verfügbar
 */
export function isFileAPISupported() {
  return typeof Blob !== 'undefined' && 
         typeof URL !== 'undefined' && 
         typeof URL.createObjectURL === 'function';
}

/**
 * Dateigröße in menschenlesbarem Format anzeigen
 * 
 * @param {number} bytes - Größe in Bytes
 * @returns {string} - Formatierte Größe (z.B. "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validierung für Datei-Uploads
 * 
 * @param {File} file - Hochgeladene Datei
 * @param {Array<string>} allowedTypes - Erlaubte Dateitypen (z.B. ['.mscz'])
 * @param {number} maxSizeMB - Maximale Größe in MB
 * @returns {Promise<{valid: boolean, error?: string}>} - Validierungs-Ergebnis
 */
export async function validateUploadFile(file, allowedTypes = ['.mscz'], maxSizeMB = 20) {
  try {
    // Dateityp prüfen
    const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
    if (!allowedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: `Nur ${allowedTypes.join(', ')} Dateien erlaubt`,
      };
    }
    
    // Dateigröße prüfen
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Datei zu groß (${formatFileSize(file.size)}). Maximal ${maxSizeMB} MB erlaubt.`,
      };
    }
    
    // Dateiname prüfen (basic)
    if (file.name.length > 200) {
      return {
        valid: false,
        error: 'Dateiname zu lang (max. 200 Zeichen)',
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Datei-Validierung fehlgeschlagen: ${error.message}`,
    };
  }
}

export default {
  downloadFile,
  createZip,
  downloadPDF,
  downloadAllAsZip,
  createDownloadLink,
  isFileAPISupported,
  formatFileSize,
  validateUploadFile,
};