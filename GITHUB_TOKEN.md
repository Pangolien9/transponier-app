# GitHub Personal Access Token erstellen

## Schritt 1: Token erstellen

1. Gehe zu: **https://github.com/settings/tokens/new**
2. Fülle aus:
   - **Note:** `Transponier-App Deployment`
   - **Expiration:** `90 days` (oder länger)
   - **Select scopes:** Setze Häkchen bei:
     - ✅ `repo` (alle Unterpunkte)
     - ✅ `workflow`
3. Scrolle runter und klicke **"Generate token"**
4. ⚠️ **WICHTIG:** Kopiere das Token SOFORT (sieht aus wie `ghp_xxxxxxxxxxxx`)
   - Du siehst es nur EINMAL!
   - Speichere es irgendwo sicher (Notizen, Passwort-Manager)

## Schritt 2: Mit Token pushen

```bash
cd ~/code/transponier_app
git push -u origin main
```

Wenn nach Password gefragt wird:
- **Username:** `Pangolien9`
- **Password:** Das Token einfügen (nicht dein GitHub-Passwort!)

## Alternative: SSH-Keys (empfohlen für die Zukunft)

Falls du öfter mit Git arbeitest, ist SSH bequemer:

```bash
# SSH-Key generieren
ssh-keygen -t ed25519 -C "deine-email@example.com"

# Public Key anzeigen
cat ~/.ssh/id_ed25519.pub

# Kopiere die Ausgabe und füge sie hinzu unter:
# https://github.com/settings/ssh/new
```

Dann änderst du die Remote-URL:
```bash
git remote set-url origin git@github.com:Pangolien9/transponier-app.git
git push -u origin main
```

## Schritt 3: Nach erfolgreichem Push

GitHub Actions startet automatisch. Gehe zu:
https://github.com/Pangolien9/transponier-app/actions

Dann aktiviere GitHub Pages:
https://github.com/Pangolien9/transponier-app/settings/pages
→ Source: "GitHub Actions"

## Deine finale URL

Nach ~2 Minuten:
```
https://pangolien9.github.io/transponier-app
```
