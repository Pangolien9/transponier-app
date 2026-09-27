# GitHub Deployment - Schritt für Schritt

## ✅ Was schon fertig ist

- Git-Repository initialisiert
- Code committed (2 Commits)
- GitHub Actions Workflow eingerichtet
- Vite für GitHub Pages konfiguriert

## 🚀 Jetzt bist du dran

### Schritt 1: GitHub-Repo erstellen

1. Gehe zu: **https://github.com/new**
2. Fülle aus:
   - **Repository name:** `transponier-app`
   - **Visibility:** Public
   - **WICHTIG:** ❌ KEINE Häkchen setzen (kein README, kein .gitignore)
3. Klicke **"Create repository"**

### Schritt 2: Code hochladen

Öffne dein Terminal in `~/code/transponier_app` und führe aus:

```bash
# Ersetze DEIN_USERNAME mit deinem GitHub-Username
git remote add origin https://github.com/DEIN_USERNAME/transponier-app.git
git push -u origin main
```

GitHub wird nach deinem Passwort fragen. Falls du 2FA aktiviert hast, brauchst du ein **Personal Access Token** statt Passwort.

### Schritt 3: GitHub Pages aktivieren

1. Gehe zu: **https://github.com/DEIN_USERNAME/transponier-app/settings/pages**
2. Bei **"Source"** wähle: **GitHub Actions**
3. Der Workflow startet automatisch

### Schritt 4: Warten (~2 Minuten)

- Gehe zu: **https://github.com/DEIN_USERNAME/transponier-app/actions**
- Warte bis der grüne Haken erscheint ✓

### Schritt 5: Fertig! 🎉

Deine App ist online unter:
```
https://DEIN_USERNAME.github.io/transponier-app
```

Diesen Link kannst du deinen Freunden schicken!

---

## 🔄 Updates pushen

Wenn du später Änderungen machst:

```bash
cd ~/code/transponier_app
# ... ändere Dateien ...
git add -A
git commit -m "Deine Änderung"
git push
```

Die App wird automatisch nach ~2 Min aktualisiert.

---

## 🆘 Falls Probleme auftreten

**"Authentication failed"**
→ Du brauchst ein Personal Access Token: https://github.com/settings/tokens/new
   - Setze Häkchen bei: `repo` und `workflow`
   - Verwende das Token statt deinem Passwort

**"Pages build failed"**
→ Stelle sicher, dass in den Repo-Settings unter "Pages" die Source auf "GitHub Actions" steht

**"404 Not Found" beim Öffnen der URL**
→ Warte noch 1-2 Minuten, Deployment braucht etwas Zeit

---

## 📋 Quick Reference

| Was | Wo |
|-----|-----|
| Repo-Settings | `github.com/DEIN_USERNAME/transponier-app/settings` |
| GitHub Pages Settings | `github.com/DEIN_USERNAME/transponier-app/settings/pages` |
| Actions (Deploy-Status) | `github.com/DEIN_USERNAME/transponier-app/actions` |
| Live-App | `DEIN_USERNAME.github.io/transponier-app` |

---

**Dein nächster Schritt:** Gehe zu https://github.com/new und erstelle das Repo!
