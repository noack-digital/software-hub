# Release v1.1.0: Dashboard-Visualisierungen und Frontend-Verbesserungen

## 🎉 Neue Features

### 🤖 Gemini AI Integration
- **KI-gestützte Software-Erstellung**
  - Automatisches Befüllen von Software-Formularen mit KI
  - Generiert deutsche und englische Beschreibungen
  - Automatische Kategorisierung von Software
  - Automatische Zielgruppen-Zuordnung
  - Features, Alternativen und Notizen werden automatisch generiert
  - URL-Erkennung und Validierung

- **KI-gestützte Übersetzungen**
  - Übersetzung von Kategorien (Deutsch ↔ Englisch)
  - Übersetzung von Zielgruppen (Deutsch ↔ Englisch)
  - Automatische Übersetzung mit einem Klick
  - Unterstützung für mehrere Gemini-Modelle (gemini-2.5-flash, gemini-2.0-flash)
  - Intelligente Fehlerbehandlung bei API-Quota-Problemen

- **AI-Einstellungen**
  - Zentrale Verwaltung des Gemini API-Keys
  - API-Key-Validierung und Test-Funktion
  - Visualisierung des API-Key-Status
  - Möglichkeit zum Löschen und Ersetzen des API-Keys
  - Unterstützung für verschiedene Gemini-Modelle

- **AI-gestützter Favicon-Download**
  - Automatische URL-Erkennung wenn URL fehlt
  - Intelligenter Favicon-Download für Software ohne Logo
  - Integration in Software-Erstellung und -Bearbeitung

### 📊 Dashboard-Visualisierungen
- **Tortendiagramme für Kategorien und Zielgruppen** im Admin-Dashboard
  - Nebeneinander angeordnete Diagramme für bessere Übersicht
  - Prozentanzeige direkt im Diagramm
  - Detaillierte Listen mit prozentualen Änderungen
  - Farbcodierte Legenden für einfache Identifikation
  - Responsive Design für alle Bildschirmgrößen

### 🎨 Frontend-Verbesserungen
- **Vollständige Kurzbeschreibung** in Software-Karten
  - Alle Karten haben jetzt die gleiche Höhe für einheitliches Layout
  - Komplette Kurzbeschreibung wird angezeigt (keine Abkürzung mehr)
  - Flexbox-Layout für optimale Platznutzung

- **Verbesserter Detail-Dialog**
  - Icon der Software vor dem Namen
  - Kategorien direkt unter dem Namen
  - Strukturierte Anzeige: Beschreibung → Typ → Kosten → Verfügbarkeit
  - Responsive Design mit Scroll-Funktion
  - Optimierte Dialog-Größe für bessere Lesbarkeit

### 📥 CSV-Import/Export
- **Vollständiger Export** aller Felder:
  - Deutsche und englische Übersetzungen
  - Features, Alternativen, Notizen (DE & EN)
  - Kategorien und Zielgruppen
  - Logo/Favicon-URLs
  - Software-Typen und Verfügbarkeit

- **Verbesserter CSV-Parser**
  - Unterstützt Zeilenumbrüche innerhalb von Anführungszeichen
  - Automatische Header-Erkennung
  - Fallback auf Standard-Header wenn keine Header-Zeile vorhanden
  - Detaillierte Fehlerbehandlung und Debug-Logging
  - Korrekte Behandlung von escaped Quotes (`""`)

- **Import-Verbesserungen**
  - Unterstützung für Kategorien und Zielgruppen beim Import
  - Automatisches Mapping von Namen zu IDs
  - Detaillierte Fehlermeldungen pro Zeile
  - Fortschrittsanzeige und Erfolgsmeldungen

### 👥 Zielgruppen-Management
- **Vollständige CRUD-Funktionalität** für Zielgruppen
  - Erstellen, Bearbeiten, Löschen von Zielgruppen
  - KI-gestützte Übersetzung (Deutsch ↔ Englisch)
  - Filterung im Frontend
  - Integration in Software-Verwaltung
  - Standard-Zielgruppen: Lehrende, Studierende, Mitarbeitende

### 🎯 DEMO-Datensatz-Verwaltung
- **DEMO-Datensatz-Funktionalität**
  - Aktuellen Stand als DEMO-Datensatz speichern
  - DEMO-Datensatz laden mit einem Klick
  - DEMO-Datensatz entfernen
  - Dismissible Banner im Admin-Bereich
  - Lokale Speicherung für schnellen Zugriff

## 🔧 Verbesserungen

### Admin-Bereich
- **Verbesserte Fehlerbehandlung**
  - Detaillierte Fehlermeldungen beim Löschen von Kategorien
  - Anzeige der Anzahl verknüpfter Software-Einträge
  - Bessere Validierung und Fehlerrückmeldungen

- **Software-Verwaltung**
  - Optimierte Software-Liste mit Icon-Spalte
  - Übersetzungs-Status-Spalte (✓/✗)
  - AI-gestützter Favicon-Download für Software ohne Logo
  - Verbesserte Bearbeitungsfunktion mit vollständigem Formular
  - Einheitliche Breite für Erstellungs- und Bearbeitungsformulare

- **Kategorien-Verwaltung**
  - Deutsche und englische Felder
  - KI-Übersetzung in beide Richtungen
  - Übersetzungs-Status-Anzeige
  - Verbesserte Validierung

### Datenbank & API
- **Erweiterte Statistiken-API**
  - Zielgruppen-Statistiken hinzugefügt
  - Prozentuale Änderungen pro Kategorie und Zielgruppe
  - Optimierte Datenbankabfragen

- **Verbesserte Import-Logik**
  - Unterstützung für Kategorien und Zielgruppen
  - Automatisches Mapping von Namen zu IDs
  - Detaillierte Fehlerbehandlung pro Zeile
  - Audit-Logging für Import-Operationen

- **Neue API-Routen**
  - `/api/ai/fill-software` - KI-gestützte Software-Erstellung
  - `/api/ai/translate-category` - KI-Übersetzung
  - `/api/ai/test-key` - API-Key-Validierung
  - `/api/target-groups` - Zielgruppen-CRUD
  - `/api/admin/demo/*` - DEMO-Datensatz-Verwaltung
  - `/api/software/fetch-favicon` - Favicon-Download
  - `/api/software/upload-logo` - Logo-Upload

### UI/UX
- **Einheitliches Design**
  - Einheitliche Kartenhöhe im Frontend
  - Verbesserte Responsive-Darstellung
  - Optimierte Dialog-Größen und Scroll-Verhalten
  - Konsistente Farbpalette für Diagramme
  - Verbesserte Typografie und Abstände

- **Internationalisierung**
  - Vollständige Unterstützung für Deutsch und Englisch
  - Sprachumschaltung im Frontend
  - Lokalisierte Fehlermeldungen
  - Übersetzte UI-Elemente

## 📊 Technische Details

### Neue Abhängigkeiten
- `recharts` - Für interaktive Diagramme im Dashboard
- `@google/generative-ai` - Für Gemini AI Integration

### Datenbank-Änderungen
- Neue `TargetGroup` Tabelle mit englischen Feldern
- Neue `SoftwareTargetGroup` Join-Tabelle (Many-to-Many)
- Erweiterte `Category` Tabelle mit englischen Feldern (`nameEn`, `descriptionEn`)
- Erweiterte `Software` Tabelle:
  - Englische Felder: `nameEn`, `shortDescriptionEn`, `descriptionEn`, `featuresEn`, `alternativesEn`, `notesEn`
  - Neue Felder: `features`, `alternatives`, `notes`
- Erweiterte `AuditLog` Tabelle:
  - `model` statt `entity`
  - `recordId` statt `entityId`
  - `changes` als Text-Feld für JSON-Daten

### Migrations
- `20250113120000_add_category_english_fields` - Englische Felder für Kategorien
- `20251113130058_add_english_fields` - Englische Felder für Software

### Konfiguration
- Gemini API-Key-Verwaltung über Admin-Einstellungen
- Unterstützung für verschiedene Gemini-Modelle
- Konfigurierbare Logo-Anzeige
- DEMO-Datensatz-Verwaltung

## 🐛 Bugfixes

- **CSV-Import**
  - Behebung von Problemen mit Zeilenumbrüchen in Feldern
  - Korrekte Behandlung von leeren Feldern
  - Verbesserte Header-Erkennung
  - Korrekte Parsing von escaped Quotes

- **Kategorie-Verwaltung**
  - Verbesserte Fehlermeldungen beim Löschen
  - Korrekte Anzeige der Anzahl verknüpfter Software-Einträge

- **Frontend**
  - Einheitliche Kartenhöhe behoben
  - Detail-Dialog: Korrekte Reihenfolge der Informationen
  - Logo-Anzeige korrigiert

- **API**
  - Verbesserte Fehlerbehandlung bei Gemini API-Quota-Problemen
  - Fallback-Mechanismen für verschiedene Modelle
  - Robustere Favicon-Download-Logik

## 📝 Migration

Für bestehende Installationen:

1. **Datenbank-Migrationen**
   - Migrationen werden automatisch angewendet
   - Neue Tabellen werden erstellt
   - Bestehende Daten bleiben erhalten

2. **Zielgruppen**
   - Neue Zielgruppen müssen manuell erstellt werden
   - Standard-Zielgruppen: Lehrende, Studierende, Mitarbeitende
   - Software kann nachträglich Zielgruppen zugeordnet werden

3. **CSV-Exporte**
   - Alte CSV-Exporte enthalten nicht alle Felder
   - Neue Exporte sollten erstellt werden für vollständige Daten
   - Import unterstützt sowohl alte als auch neue Formate

4. **Gemini AI**
   - API-Key muss in den Einstellungen konfiguriert werden
   - Verfügbar unter: `/admin/settings/ai`
   - Test-Funktion zum Validieren des API-Keys

## 🔗 Links

- [GitHub Repository](https://github.com/noack-digital/software-hub)
- [Dokumentation](./README.md)

## 🙏 Danksagungen

Vielen Dank für das Feedback und die Unterstützung bei der Entwicklung dieser Version!

---

**Vollständige Änderungsliste:** Siehe [Commit-Historie](https://github.com/noack-digital/software-hub/compare/v1.0.1...v1.1.0)

**Anzahl der Änderungen:**
- 44 Dateien geändert
- 6.570 Zeilen hinzugefügt
- 501 Zeilen entfernt
- 18 neue Dateien erstellt
