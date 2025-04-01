# Software Hub

Eine Webanwendung zur Verwaltung von Softwareeinträgen, entwickelt mit Next.js, Prisma und PostgreSQL.

## Über das Projekt

Software Hub ist eine Anwendung zur Verwaltung und Präsentation von Software-Ressourcen. Sie wurde von Alexander Noack für die Hochschule für Nachhaltige Entwicklung Eberswalde (HNEE) entwickelt.

## Funktionen

- Hinzufügen, Bearbeiten und Löschen von Softwareeinträgen
- Kategorisierung von Software
- Filterung nach Kategorien
- Suchfunktion für Software
- Anpassbare Badges für Verfügbarkeitsstatus
- Admin-Bereich für Einstellungen und Verwaltung
- Benutzerauthentifizierung und Rollenverwaltung
- Einbettungsmöglichkeiten für externe Webseiten (iFrame, JavaScript, WordPress, TYPO3, Moodle)
- Konfigurierbare Footer-Links (Impressum, Datenschutz)
- Export-Funktion für Software-Daten
- **Mehrsprachigkeitsunterstützung** (Deutsch und Englisch)
- **Sprachumschalter** für einfachen Wechsel zwischen den verfügbaren Sprachen
- **Konfigurierbare UI-Einstellungen** (z.B. Sticky Header ein-/ausschalten)

## Technologien

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Datenbank**: PostgreSQL mit Prisma ORM
- **Authentifizierung**: NextAuth.js
- **Internationalisierung**: Eigene i18n-Implementierung mit JSON-Dateien

## Entwicklung starten

### Voraussetzungen

- Node.js (v18 oder höher)
- PostgreSQL Datenbank
- npm oder yarn

### Installation

1. Repository klonen:
   ```bash
   git clone https://github.com/noack-digital/software-hub.git
   cd software-hub
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   # oder
   yarn install
   ```

3. Umgebungsvariablen einrichten:
   Erstelle eine `.env.local` Datei im Hauptverzeichnis und füge folgende Variablen hinzu:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/softwarehub"
   NEXTAUTH_SECRET="dein-geheimer-schlüssel"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Datenbank initialisieren:
   ```bash
   npx prisma migrate dev
   ```

5. Entwicklungsserver starten:
   ```bash
   npm run dev
   # oder
   yarn dev
   ```

6. Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser.

## Docker-Entwicklung

Alternativ kann die Anwendung mit Docker entwickelt werden:

```bash
docker-compose up -d
```

Die Anwendung ist dann unter folgenden URLs verfügbar:
- Produktionsversion: [http://localhost:3002](http://localhost:3002)
- Entwicklungsversion: [http://localhost:3001](http://localhost:3001)

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
