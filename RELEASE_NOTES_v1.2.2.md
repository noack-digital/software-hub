# Release Notes v1.2.2

**Veröffentlichungsdatum:** 12. Dezember 2025  
**Typ:** 🔐 Security Update (kritisch)

## ⚠️ WICHTIG: Sofortiges Update erforderlich

Dieses Release behebt **kritische Sicherheitslücken** (CVSS 10.0), die die Ausführung beliebigen Programmcodes aus der Ferne ohne Authentifizierung ermöglichten.

## 🔒 Behobene Sicherheitslücken

### CVE-2025-55182 (React Server Components)
- **Schweregrad:** Kritisch (CVSS 10.0)
- **Betroffen:** React Server Components in Version 19.0, 19.1.0, 19.1.1 und 19.2.0
- **Pakete:** `react-server-dom-webpack`, `react-server-dom-parcel`, `react-server-dom-turbopack`

### CVE-2025-66478 (Next.js App Router)
- **Schweregrad:** Kritisch (CVSS 10.0)
- **Betroffen:** Next.js 15.x, 16.x, 14.3.0-canary.77 und spätere Versionen
- **Betroffen:** Next.js-Anwendungen, die den App Router verwenden

## 📦 Änderungen

### Dependencies
- **Next.js:** `15.1.6` → `15.1.11` (neueste gepatchte Version)
- **eslint-config-next:** `15.1.6` → `15.1.11` (für Konsistenz)

### Versionierung
- Version auf `1.2.2` erhöht
- Exakte Version gepinnt (kein Caret `^`) für maximale Sicherheit

## 🚀 Update-Anleitung

### Für bestehende Installationen:

```bash
# Im Projektverzeichnis
npm install next@15.1.11 eslint-config-next@15.1.11

# Oder mit npm ci für saubere Installation
rm -rf node_modules package-lock.json
npm install
```

### Für Docker-Installationen:

```bash
# Container neu bauen
docker compose build
docker compose up -d
```

### Für Production-Deployments:

1. **Sofortiges Update empfohlen** – diese Schwachstellen sind aktiv ausnutzbar
2. Container/Service neu starten nach dem Update
3. Build-Cache löschen falls nötig: `rm -rf .next`

## 📚 Weitere Informationen

- **React Security Advisory:** https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components
- **Next.js Security Advisory:** https://nextjs.org/blog/CVE-2025-66478
- **Sicherheitsforschung:** https://react2shell.com/
- **Wiz.io Analyse:** https://www.wiz.io/blog/critical-vulnerability-in-react-cve-2025-55182

## ✅ Verifizierung

Nach dem Update können Sie die installierte Version prüfen:

```bash
npm ls next
# Sollte zeigen: next@15.1.11
```

## 🔄 Migration von v1.2.1

Keine Breaking Changes. Einfach die Dependencies aktualisieren und neu bauen.

---

**Bitte aktualisieren Sie umgehend, um Ihre Installation zu schützen.**
