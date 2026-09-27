# Transponier-App

Client-seitige React-App zum Extrahieren und Transponieren einzelner Stimmen aus Notendateien. Alles läuft im Browser, keine Datei verlässt das Gerät.

## Features

- Upload von `.mscz`, `.mscx`, `.musicxml`, `.xml` und `.mxl`
- Automatische Instrumenterkennung
- Transposition pro Stimme (-12 bis +12 Halbtöne)
- Presets für Concert Pitch, Bb, Eb und F
- PDF-Export je Stimme, optional als ZIP
- Mobile-taugliches Schwarz/Weiß-Interface

## Start

```bash
cd ~/code/transponier_app
npm install
npm run dev
```

Dann im Browser `http://localhost:5173` öffnen.

Zum Testen liegt `public/beispiel.musicxml` bereit (Flöte, Klarinette, Horn, Cello).

## Build

```bash
npm run build
npm run preview
```

Der Ordner `dist/` kann später z. B. auf GitHub Pages gelegt werden.

## Projektstruktur

```
src/
  components/     UI
  utils/          Parsing, Transposition, PDF
  config/         Feature-Flags und Defaults
  styles/         Tailwind
```

Neue Features gehören meist in `src/utils/` (Logik) oder `src/components/` (UI). Feature-Flags liegen in `src/config/features.js`.

## Hinweise

- `.mscz` ist ein ZIP mit MuseScore-XML (`.mscx`). Die App konvertiert das intern nach MusicXML.
- Sehr komplexe MuseScore-Dateien (viele Spezialnotationen) können unvollständig konvertiert werden. In dem Fall in MuseScore als MusicXML exportieren und diese Datei hochladen.
- Percussion ohne Tonhöhe wird übersprungen.
- OpenSheetMusicDisplay macht das Bundle groß (~2 MB). Das ist beim ersten Laden normal.
