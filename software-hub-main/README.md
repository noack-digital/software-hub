# Software Hub – PHP Version

Eine Webanwendung zur Verwaltung von Softwareeinträgen, entwickelt mit **PHP 8**, **MariaDB** und einem schlanken Admin-Frontend ohne Frameworks.

## Über das Projekt

Software Hub ist eine Anwendung zur Verwaltung und Präsentation von Software-Ressourcen. Sie wurde von Alexander Noack für die Hochschule für Nachhaltige Entwicklung Eberswalde (HNEE) entwickelt.

Im Repository befindet sich ausschließlich die **PHP-Version** unter `software-hub-php/`. Das frühere Next.js-Original wird nur noch als gestalterische Referenz in der Dokumentation erwähnt.

## Funktionen

- Hinzufügen, Bearbeiten und Löschen von Softwareeinträgen
- Kategorisierung von Software
- Zielgruppenverwaltung
- Filterung nach Kategorien und Zielgruppen
- Suchfunktion für Software
- Admin-Bereich für Einstellungen und Verwaltung
- Einbettungsmöglichkeiten für externe Webseiten (iFrame, JavaScript, WordPress, TYPO3, Moodle)
- Konfigurierbare Footer-Links (Impressum, Datenschutz)
- Import/Export-Funktionen und DEMO-Datensatz mit One-Click-Import
- DSGVO-Ampel inklusive Inhouse-Hosting-Logo mit Tooltip
- **Mehrsprachigkeitsunterstützung** (Deutsch und Englisch)
- **Sprachumschalter** für einfachen Wechsel zwischen den verfügbaren Sprachen

## Technologien

- **Backend**: PHP 8.3+, PDO/MariaDB
- **Webserver**: Apache (mit `mod_rewrite`)
- **Frontend**: Vanilla JavaScript, CSS mit Custom Properties
- **Datenbank**: MariaDB / MySQL
- **Internationalisierung**: JSON-Dateien unter `messages/`

## Schnellstart mit Docker

Voraussetzungen:

- Docker und Docker Compose

### Starten

Im Projektwurzelordner:

```bash
docker compose up -d --build
```

Danach:

- Anwendung: `http://localhost:8080`
- PHP-Code liegt im Container unter `/var/www/html` (gemountete `uploads/`-Ordner bleiben auf dem Host).

### Datenbank

Der `docker-compose.yml` startet automatisch eine MariaDB-Instanz mit Standardwerten:

- Datenbank: `software_hub`
- Benutzer: `software_hub`
- Passwort: `SoftwareHub2024`

Diese Werte kannst du über Umgebungsvariablen (`DB_NAME`, `DB_USER`, `DB_PASS`, `DB_ROOT_PASSWORD`) überschreiben.

## Admin-Bereich

Der Admin-Bereich bietet folgende Funktionen:

### Software-Verwaltung
- Hinzufügen, Bearbeiten und Löschen von Software-Einträgen
- Kategorien zuweisen
- Verfügbarkeitsstatus festlegen

### Import/Export
- Export von Software-Daten als Excel-Datei
- Formatierte Ausgabe von Kategorien und Typen

### Einbetten
- Verschiedene Optionen zur Einbettung des Software-Hubs in externe Webseiten:
  - iFrame-Einbettung
  - JavaScript-Einbettung
  - WordPress-Integration mit Shortcode
  - TYPO3-Integration
  - Moodle-Integration
  - REST API-Zugriff

### Einstellungen
- Badge-Einstellungen (Farben, Anzeige)
- Link-Einstellungen:
  - URLs für Impressum und Datenschutz konfigurieren
  - Links in neuem Tab öffnen
  - Footer-Links ein-/ausblenden
- UI-Einstellungen:
  - Sticky Header ein-/ausschalten
- Spracheinstellungen:
  - Standardsprache festlegen
  - Verfügbare Sprachen verwalten

## Mehrsprachigkeit

Die Anwendung unterstützt mehrere Sprachen. Aktuell verfügbar sind:
- Deutsch (de)
- Englisch (en)

Die Übersetzungen befinden sich im Verzeichnis `messages/` und können bei Bedarf erweitert oder angepasst werden.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.

## Autor

Alexander Noack - Hochschule für Nachhaltige Entwicklung Eberswalde (HNEE)

## Mitwirken

Beiträge sind willkommen! Bitte fühlen Sie sich frei, Issues zu erstellen oder Pull Requests einzureichen.
