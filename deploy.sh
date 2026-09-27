#!/bin/bash
# GitHub Deploy-Befehle
# Ersetze DEIN_GITHUB_USERNAME mit deinem echten GitHub-Username

GITHUB_USERNAME="DEIN_GITHUB_USERNAME"

echo "Schritt 1: Remote hinzufügen..."
git remote add origin https://github.com/$GITHUB_USERNAME/transponier-app.git

echo "Schritt 2: Code pushen..."
git push -u origin main

echo "✓ Fertig! Code ist auf GitHub."
echo ""
echo "Nächster Schritt: GitHub Pages aktivieren"
echo "Gehe zu: https://github.com/$GITHUB_USERNAME/transponier-app/settings/pages"
