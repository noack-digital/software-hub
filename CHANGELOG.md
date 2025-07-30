# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-07-30

### 🚀 Patch Release - UI/UX Improvements & Bug Fixes

#### ✨ Added - Neue Features
- **🔗 GitHub Repository Link** in Admin-Sidebar Footer
  - GitHub-Icon neben der Versionsnummer hinzugefügt
  - Direkter Link zum Repository mit Hover-Effekt
  - Tooltip für bessere Benutzerführung

#### 🐛 Fixed - Behobene Probleme
- **📋 Clipboard Copy Funktionalität** auf Embed-Seite repariert
  - Problem: `navigator.clipboard` funktionierte nur in sicheren Kontexten (HTTPS/localhost)
  - Lösung: Fallback-Mechanismus für unsichere Kontexte implementiert
  - Verwendet `document.execCommand('copy')` als Fallback für HTTP-Deployments
  - Alle Kopieren-Buttons (iFrame, JavaScript, WordPress) funktionieren jetzt korrekt

- **🔧 JSX Syntax Errors** in Sidebar-Komponente behoben
  - Doppelte JSX-Blöcke entfernt, die Build-Fehler verursachten
  - Sidebar.tsx kompiliert jetzt fehlerfrei
  - Container-Builds laufen wieder erfolgreich durch

#### 🎨 Improved - Verbesserungen
- **📱 Admin-Sidebar Footer** Design optimiert
  - Bessere Anordnung von Version und GitHub-Link
  - Konsistente Hover-Effekte und Übergänge
  - Verbesserte Benutzerfreundlichkeit

#### 🔧 Technical Changes
- **Environment Variables** korrekt konfiguriert:
  - `NEXT_PUBLIC_APP_VERSION` für dynamische Versionanzeige
  - `NEXTAUTH_URL` und `NEXT_PUBLIC_BASE_URL` für korrekte Redirects
- **Docker Container** erfolgreich rebuilt und getestet
- **Build-Pipeline** stabilisiert und optimiert

#### 🧪 Tested & Verified
- ✅ **Sidebar GitHub-Link** funktioniert korrekt und öffnet Repository
- ✅ **Clipboard Copy** auf allen Embed-Code-Typen getestet
- ✅ **Container Build** läuft fehlerfrei durch
- ✅ **Version Display** zeigt korrekte v1.0.1 an
- ✅ **Responsive Design** bleibt auf allen Geräten erhalten

---

## [1.0.0] - 2025-07-04

### 🚀 Major Release - Production Ready

Dies ist die erste stabile Version des Software-Hub, die für den produktiven Einsatz bereit ist.

#### ✨ Added - Neue Features
- **🌐 Dynamische Base-URL-Erkennung** - Funktioniert automatisch auf jeder IP-Adresse, Domain und jedem Port
- **🚀 Zero-Configuration Deployment** - Keine manuellen URL-Einstellungen erforderlich
- **📦 Vollständige Docker-Containerisierung** mit PostgreSQL 16
- **🔧 Admin-Panel** mit umfassender Verwaltung:
  - Software-CRUD-Operationen
  - Benutzer- und Rollenverwaltung
  - Kategorien- und Zielgruppen-Management
  - Einstellungen für Frontend-Anzeige
- **🎨 Konfigurierbare Badge-System**:
  - Anpassbare Farben und Texte
  - Verfügbarkeits-Status-Anzeige
  - Ein-/Ausschaltbare Anzeige
- **🔗 Footer-Links-Verwaltung** mit Admin-Interface
- **📊 Import/Export-Funktionalität** (CSV-Format)
- **🌐 Embed-Funktionalität** für externe Websites:
  - Automatische URL-Generierung
  - iFrame-Code-Generator
  - JavaScript-Embed-Code
  - WordPress-Shortcode-Unterstützung
- **📱 Responsive Design** optimiert für alle Geräte
- **🔍 Erweiterte Suchfunktion** mit Filtern
- **🔐 Sichere Authentifizierung** mit NextAuth.js

#### 🔧 Technical Implementation
- **Frontend**: Next.js 15 mit App Router, React 18, TypeScript
- **Backend**: Next.js API Routes mit typsicheren Endpunkten
- **Datenbank**: PostgreSQL 16 mit Prisma ORM
- **Styling**: Tailwind CSS + Shadcn/ui Komponenten
- **Authentifizierung**: NextAuth.js mit JWT-Strategie
- **Deployment**: Docker Compose für einfache Bereitstellung
- **Automatische Migrationen**: Prisma-basierte Datenbankmigrationen
- **Intelligentes Seeding**: Überspringt vorhandene Daten

#### 🌟 Key Features
- **Universal Deployment**: Läuft auf localhost, Servern, Cloud-Plattformen
- **Embed-Integration**: Kompatibel mit Moodle, TYPO3, WordPress
- **Admin-Dashboard**: Vollständige Kontrolle über alle Aspekte
- **Responsive UI**: Mobile-First Design mit Desktop-Optimierung
- **Type Safety**: Vollständige TypeScript-Implementierung
- **Database Integrity**: Automatische Schema-Validierung

#### 🐛 Fixed - Behobene Probleme
- **Fehlende FooterLink-Tabelle** erstellt und migriert
- **Badge-Einstellungen** vollständig implementiert und getestet
- **Target Groups Toggle** funktioniert korrekt
- **API-Endpunkte** arbeiten konsistent mit relativen URLs
- **Datenbank-Seeding** überspringt vorhandene Einträge
- **URL-Konfiguration** automatisiert für alle Deployment-Szenarien

#### 📚 Documentation
- **Umfassende README** mit Quick-Start-Anleitung
- **Docker Deployment Guide** für verschiedene Umgebungen
- **API-Dokumentation** für alle Endpunkte
- **Embed-Integration-Guide** für externe Websites
- **Entwickler-Dokumentation** für lokale Entwicklung
- **MIT-Lizenz** für Open-Source-Nutzung
- **Troubleshooting-Guide** für häufige Probleme

#### 🧪 Tested & Verified
- ✅ **API-Endpunkte** funktionieren auf verschiedenen Hosts
- ✅ **Base-URL-Erkennung** mit Custom-Headers getestet
- ✅ **Docker-Deployment** auf verschiedenen Umgebungen
- ✅ **Admin-Funktionen** vollständig getestet
- ✅ **Embed-Codes** in verschiedenen CMS-Systemen
- ✅ **Responsive Design** auf mobilen Geräten
- ✅ **Datenbank-Migrationen** automatisch und fehlerfrei

#### 🚀 Deployment Benefits
- **Zero-Configuration**: Keine manuellen Einstellungen erforderlich
- **Universal Compatibility**: Funktioniert überall ohne Anpassungen
- **Production-Ready**: Optimiert für Produktionsumgebungen
- **Scalable**: Bereit für horizontale Skalierung
- **Secure**: Sichere Authentifizierung und Datenbankzugriff
- **Maintainable**: Klare Projektstruktur und Dokumentation

---

## [Unreleased]

### Geplante Features für zukünftige Versionen
- **Multi-Language Support** (Deutsch/Englisch)
- **Advanced Analytics** Dashboard
- **API Rate Limiting** für öffentliche Endpunkte
- **Backup/Restore** Funktionalität
- **Theme Customization** für Branding
- **Advanced Search** mit Elasticsearch
- **Notification System** für Admin-Aktionen
- **Audit Logging** für Compliance

---

## Versioning

Dieses Projekt verwendet [Semantic Versioning](https://semver.org/):
- **MAJOR** Version für inkompatible API-Änderungen
- **MINOR** Version für neue Features (rückwärtskompatibel)
- **PATCH** Version für Bugfixes (rückwärtskompatibel)

## Support

- **GitHub Issues**: [Bug Reports & Feature Requests](https://github.com/noack-digital/software-hub/issues)
- **Dokumentation**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)