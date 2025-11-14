# GitHub Repository Neu-Anlegen - Anleitung

## Option 1: Repository komplett neu erstellen (empfohlen)

### Schritt 1: Altes Repository auf GitHub löschen/umbenennen

1. Gehen Sie zu: https://github.com/noack-digital/software-hub/settings
2. Scrollen Sie ganz nach unten zum Bereich "Danger Zone"
3. Klicken Sie auf "Delete this repository"
4. Geben Sie den Repository-Namen zur Bestätigung ein: `noack-digital/software-hub`
5. Bestätigen Sie die Löschung

**ODER** (wenn Sie das alte Repository behalten möchten):
- Benennen Sie das alte Repository um (z.B. `software-hub-old`)
- Erstellen Sie ein neues Repository mit dem Namen `software-hub`

### Schritt 2: Neues Repository auf GitHub erstellen

1. Gehen Sie zu: https://github.com/new
2. Repository-Name: `software-hub`
3. Beschreibung: "Software Hub - Verwaltung von Software-Ressourcen mit KI-Unterstützung"
4. Sichtbarkeit: Wählen Sie Public oder Private
5. **WICHTIG**: Lassen Sie alle Checkboxen leer (kein README, keine .gitignore, keine Lizenz)
6. Klicken Sie auf "Create repository"

### Schritt 3: Lokales Repository vorbereiten

```bash
cd /home/anoack/.cursor/worktrees/software-hub/NKPkc

# Entferne alte Remote-Verbindung
git remote remove origin

# Füge neue Remote-Verbindung hinzu
git remote add origin git@github.com:noack-digital/software-hub.git

# Prüfe Remote-Verbindung
git remote -v
```

### Schritt 4: Code hochladen

```bash
# Stelle sicher, dass alle Änderungen committed sind
git status

# Pushe alle Branches und Tags
git push -u origin main
git push origin --all
git push origin --tags
```

## Option 2: Bestehendes Repository überschreiben (schneller)

Wenn Sie das bestehende Repository behalten möchten, aber den Inhalt komplett ersetzen:

```bash
cd /home/anoack/.cursor/worktrees/software-hub/NKPkc

# Stelle sicher, dass alle Änderungen committed sind
git add -A
git commit -m "chore: Vollständige Codebasis für Release v1.1.0"

# Force-Push zum Main-Branch (überschreibt alles)
# WICHTIG: Dies überschreibt die gesamte Historie auf GitHub!
git push origin main --force

# Pushe Tags
git push origin --tags
```

**⚠️ Warnung**: Option 2 überschreibt die gesamte Git-Historie auf GitHub. Alle bestehenden Pull Requests, Issues und andere Referenzen können verloren gehen.

## Nach dem Upload: Release erstellen

1. Gehen Sie zu: https://github.com/noack-digital/software-hub/releases/new
2. Wählen Sie Tag: `v1.1.0`
3. Titel: `Release v1.1.0: Dashboard-Visualisierungen und Frontend-Verbesserungen`
4. Kopieren Sie den Inhalt aus `RELEASE_NOTES_v1.1.0.md` in das Beschreibungsfeld
5. Klicken Sie auf "Publish release"

## Verifizierung

Nach dem Upload sollten Sie sehen:
- Alle Dateien im Repository
- Tag `v1.1.0` unter Releases
- Vollständige Commit-Historie
- Release Notes mit allen Features

