This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
   git clone https://github.com/alexandernoack/software-hub.git
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
