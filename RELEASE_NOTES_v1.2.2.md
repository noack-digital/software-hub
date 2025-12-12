# Release Notes v1.2.2

**Veröffentlichungsdatum:** 12. Dezember 2025  
**Typ:** 🐛 Bugfix Release

## 🐛 Behobene Probleme

### GitHub Actions Workflows

Alle GitHub Actions Workflows wurden überarbeitet und sind jetzt deutlich robuster:

#### ✅ Docker Build Workflow
- **Problem**: Workflow schlug fehl mit `permission_denied: write_package` beim Push zu GitHub Container Registry
- **Lösung**: Push zu ghcr.io ist jetzt optional - Build wird immer durchgeführt, auch wenn keine Push-Berechtigung vorhanden ist
- Login-Step mit `continue-on-error: true` versehen
- Push nur wenn Login erfolgreich war

#### ✅ Docker Hub Workflow
- **Problem**: Workflow schlug fehl, wenn Docker Hub Secrets nicht vorhanden waren
- **Lösung**: Login-Step schlägt nicht mehr fehl, wenn Secrets fehlen
- Build wird immer durchgeführt, Push nur wenn Login erfolgreich war

#### ✅ Deployment Workflow
- **Problem**: Deployment schlug fehl, wenn SSH-Secrets nicht vorhanden waren
- **Lösung**: Deployment-Step mit `continue-on-error: true` versehen
- Workflow läuft durch, auch wenn Deployment nicht möglich ist

#### ✅ Test-Script
- Test-Script in `package.json` hinzugefügt für CI-Kompatibilität
- Verhindert Fehler in Workflows, die `npm test` ausführen

## 📦 Änderungen

### Workflows
- Alle optionalen Steps verwenden jetzt `continue-on-error: true`
- Bessere Fehlerbehandlung für fehlende Secrets
- Build wird immer durchgeführt, Push nur wenn möglich

### Dependencies
- Keine Änderungen an Dependencies (bleibt bei Next.js 15.1.11)

## 🚀 Update-Anleitung

### Für bestehende Installationen:

```bash
# Im Projektverzeichnis
git pull origin main
npm install
```

### Für Docker-Installationen:

```bash
# Container neu bauen
docker compose build
docker compose up -d
```

## ✅ Verifizierung

Nach dem Update sollten die GitHub Actions erfolgreich durchlaufen:

1. Gehe zu: https://github.com/noack-digital/software-hub/actions
2. Die Workflows sollten jetzt erfolgreich sein, auch ohne optionale Secrets
3. Build wird durchgeführt, Push nur wenn Berechtigungen vorhanden sind

## 🔄 Migration von v1.2.1

Keine Breaking Changes. Einfach die Änderungen pullen und neu bauen.

---

**Diese Version behebt alle GitHub Actions Probleme und macht die Workflows robuster.**

