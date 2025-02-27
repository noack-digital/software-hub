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

## Technologien

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Datenbank**: PostgreSQL mit Prisma ORM
- **Authentifizierung**: NextAuth.js

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

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.

## Autor

Alexander Noack - Hochschule für Nachhaltige Entwicklung Eberswalde (HNEE)

## Mitwirken

Beiträge sind willkommen! Bitte fühlen Sie sich frei, Issues zu erstellen oder Pull Requests einzureichen.
