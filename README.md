# Software-Hub 🚀

Ein modernes Web-Portal zur Verwaltung und Präsentation von Software-Tools für Bildungseinrichtungen. Entwickelt für die Hochschule für Nachhaltige Entwicklung Eberswalde (HNEE).

![Software-Hub Screenshot](docs/screenshot.png)

## 🌟 Features

### 📊 **Software-Verwaltung**
- Vollständige CRUD-Operationen für Software-Einträge
- Kategorisierung und Zielgruppen-Zuordnung
- Import/Export-Funktionalität (CSV)
- Verfügbarkeits-Status mit konfigurierbaren Badges

### 🎨 **Anpassbare Benutzeroberfläche**
- Responsive Design für alle Geräte
- Konfigurierbare Badge-Farben und -Texte
- Anpassbare Footer-Links
- Suchfunktion mit erweiterten Filtern

### 🔧 **Admin-Bereich**
- Benutzer- und Rollenverwaltung
- Kategorien- und Zielgruppen-Management
- Einstellungen für Frontend-Anzeige
- Embed-Code-Generator für externe Websites

### 🌐 **Integration & Deployment**
- **Docker-Container** für einfache Bereitstellung
- **Embed-Funktionalität** für Moodle, TYPO3, WordPress
- **PostgreSQL** Datenbank mit automatischen Migrationen
- **NextAuth.js** für sichere Authentifizierung

## 🚀 Quick Start mit Docker

### Voraussetzungen
- Docker & Docker Compose
- Git

### Installation

1. **Repository klonen**
```bash
git clone https://github.com/noack-digital/software-hub.git
cd software-hub
```

2. **Mit Docker starten**
```bash
docker-compose up -d
```

3. **Anwendung öffnen**
- Frontend: http://localhost:3000
- Admin-Login: Wird beim ersten Start erstellt

Das war's! 🎉 Der Software-Hub läuft jetzt vollständig in Docker-Containern.

## 📋 Detaillierte Dokumentation

### 🐳 Docker Deployment

Der Software-Hub ist vollständig containerisiert und kann mit einem einzigen Befehl gestartet werden:

```bash
# Alle Services starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Services stoppen
docker-compose down

# Mit Datenbank-Reset
docker-compose down -v
docker-compose up -d
```

### 🔧 Konfiguration

#### Umgebungsvariablen
Die wichtigsten Einstellungen werden über Docker Compose konfiguriert:

```yaml
# docker-compose.yml
environment:
  DATABASE_URL: "postgresql://software_hub_user:software_hub_password@postgres:5432/software_hub"
  NEXTAUTH_URL: "http://localhost:3000"
  NEXTAUTH_SECRET: "your-secret-key-change-in-production"
  NEXT_PUBLIC_BASE_URL: "http://localhost:3000"
```

#### Produktions-Deployment
Für Produktionsumgebungen:

1. **Sichere Passwörter** in `docker-compose.yml` setzen
2. **HTTPS** konfigurieren (Reverse Proxy empfohlen)
3. **Backup-Strategie** für PostgreSQL-Daten implementieren
4. **Monitoring** und Logging einrichten

### 📊 Datenbank

**PostgreSQL 16** mit automatischen Migrationen:
- Prisma ORM für typsichere Datenbankoperationen
- Automatische Schema-Migrationen beim Start
- Intelligentes Seeding (überspringt vorhandene Daten)

#### Wichtige Tabellen:
- `Software` - Software-Einträge
- `Category` - Kategorien
- `TargetGroup` - Zielgruppen
- `User` - Benutzer und Rollen
- `Settings` - Konfigurationseinstellungen
- `FooterLink` - Footer-Links

### 🔐 Authentifizierung

**NextAuth.js** mit JWT-Strategie:
- Sichere Session-Verwaltung
- Rollen-basierte Zugriffskontrolle
- Admin-Bereich geschützt

### 🎨 Frontend-Features

#### Suchfunktion
- **Volltext-Suche** in Namen und Beschreibungen
- **Filter** nach Kategorien und Zielgruppen
- **Sortierung** nach verschiedenen Kriterien

#### Responsive Design
- **Mobile-First** Ansatz
- **Tablet** und **Desktop** optimiert
- **Accessibility** Standards befolgt

### 🔌 Embed-Funktionalität

Der Software-Hub kann in externe Websites eingebettet werden:

```html
<!-- Vollständige Einbettung -->
<iframe src="http://localhost:3000/embed" width="100%" height="600"></iframe>

<!-- Nur Software-Liste -->
<iframe src="http://localhost:3000/embed/software" width="100%" height="400"></iframe>
```

**Unterstützte Plattformen:**
- Moodle
- TYPO3
- WordPress
- Jede Website mit iframe-Unterstützung

## 🛠️ Entwicklung

### Lokale Entwicklung ohne Docker

```bash
# Dependencies installieren
npm install

# Datenbank starten (Docker)
docker-compose up -d postgres

# Environment Setup
cp .env.example .env.local
# .env.local bearbeiten

# Datenbank migrieren
npx prisma migrate dev
npx prisma db seed

# Development Server
npm run dev
```

### 🏗️ Technologie-Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui
- **Backend:** Next.js API Routes
- **Datenbank:** PostgreSQL 16, Prisma ORM
- **Auth:** NextAuth.js
- **Deployment:** Docker, Docker Compose

### 📁 Projektstruktur

```
software-hub/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # Admin-Bereich
│   │   ├── api/            # API Routes
│   │   └── embed/          # Embed-Seiten
│   ├── components/         # React Components
│   ├── lib/               # Utilities & Config
│   └── scripts/           # Seeding Scripts
├── prisma/                # Datenbank Schema & Migrationen
├── docker-compose.yml     # Docker Konfiguration
├── Dockerfile            # Container Build
└── docs/                 # Dokumentation
```

## 🤝 Beitragen

Wir freuen uns über Beiträge! Bitte beachten Sie:

1. **Fork** das Repository
2. **Feature Branch** erstellen (`git checkout -b feature/AmazingFeature`)
3. **Commit** Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. **Push** zum Branch (`git push origin feature/AmazingFeature`)
5. **Pull Request** öffnen

### 🐛 Bug Reports

Bitte verwenden Sie die [GitHub Issues](https://github.com/noack-digital/software-hub/issues) für Bug Reports und Feature Requests.

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

```
MIT License

Copyright (c) 2025 Alexander Noack - Hochschule für Nachhaltige Entwicklung Eberswalde (HNEE)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👥 Team

**Entwickelt von:** Alexander Noack  
**Institution:** Hochschule für Nachhaltige Entwicklung Eberswalde (HNEE)  
**Kontakt:** [GitHub](https://github.com/noack-digital)

## 🙏 Danksagungen

- **Next.js Team** für das großartige Framework
- **Prisma Team** für die ausgezeichnete ORM
- **Tailwind CSS** für das utility-first CSS Framework
- **Shadcn/ui** für die wunderschönen UI-Komponenten

---

**⭐ Wenn Ihnen dieses Projekt gefällt, geben Sie ihm einen Stern auf GitHub!**
