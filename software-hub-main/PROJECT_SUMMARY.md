# Software-Hub - Projektzusammenfassung

## Überblick
Der Software-Hub ist eine vollständige Next.js-Webanwendung zur Verwaltung und Präsentation von Software-Tools. Das Projekt wurde mit modernen Technologien entwickelt und ist vollständig containerisiert für einfache Bereitstellung.

## Hauptfunktionen

### 🔍 Frontend-Features
- **Responsive Suchoberfläche** mit erweiterten Filtern
- **Kategorien- und Zielgruppen-Filter** für präzise Suche
- **Moderne UI** mit Tailwind CSS
- **Embedding-System** für Integration in externe Websites
- **Anpassbare Footer-Links** über Admin-Interface

### 🛠️ Admin-Interface
- **Software-Verwaltung**: Hinzufügen, Bearbeiten, Löschen von Software
- **Kategorien-Management**: Flexible Kategorisierung
- **Zielgruppen-Verwaltung**: Spezifische Zielgruppenzuordnung
- **Import/Export-Funktionalität**: CSV-basierter Datenaustausch
- **Embedding-Codes**: Generierung von iframe, JavaScript und WordPress-Shortcodes
- **Footer-Konfiguration**: Anpassbare Links und Inhalte
- **Benutzer-Management**: Admin-Benutzer verwalten

### 🔐 Authentifizierung
- **NextAuth.js Integration** mit sicherer Session-Verwaltung
- **Admin-Bereich** mit Zugriffsschutz
- **Passwort-Reset-Funktionalität**

### 📊 Datenbank
- **PostgreSQL** mit Prisma ORM
- **Automatische Migrationen**
- **Seed-Daten** für Entwicklung und Tests
- **Relationale Datenstruktur** für Software, Kategorien und Zielgruppen

## Technische Architektur

### Frontend
- **Next.js 13+** mit App Router
- **React 18** mit TypeScript
- **Tailwind CSS** für Styling
- **TanStack Query** für State Management
- **Responsive Design** für alle Geräte

### Backend
- **Next.js API Routes** für REST-Endpoints
- **Prisma ORM** für Datenbankzugriff
- **PostgreSQL** als Hauptdatenbank
- **NextAuth.js** für Authentifizierung

### DevOps & Deployment
- **Docker** mit Multi-Stage Builds
- **Docker Compose** für lokale Entwicklung
- **GitHub Actions** für CI/CD
- **Multi-Platform Support** (amd64/arm64)

## Embedding-System

### Unterstützte Formate
1. **iframe-Embedding**: Direkte Integration in HTML
2. **JavaScript-Widget**: Dynamisches Laden mit Anpassungen
3. **WordPress-Shortcode**: Native WordPress-Integration

### Features
- **Automatische Base-URL-Erkennung**
- **Responsive Darstellung**
- **Anpassbare Größen**
- **Fallback-Mechanismen**

## Installation & Deployment

### Docker (Empfohlen)
```bash
git clone https://github.com/noack-digital/software-hub.git
cd software-hub
cp .env.example .env
docker compose up -d
```

### Manuelle Installation
```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build
npm start
```

## Konfiguration

### Umgebungsvariablen
- `DATABASE_URL`: PostgreSQL-Verbindungsstring
- `NEXTAUTH_SECRET`: Sicherheitsschlüssel für Sessions
- `NEXTAUTH_URL`: Basis-URL der Anwendung
- `NEXT_PUBLIC_BASE_URL`: Öffentliche URL für Embedding

### Admin-Zugang
- Standard-Login: `admin@example.com`
- Standard-Passwort: `admin123`
- **Wichtig**: Passwort nach erster Anmeldung ändern!

## Projektstruktur

```
software-hub/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # Admin-Interface
│   │   ├── api/            # API-Endpoints
│   │   └── auth/           # Authentifizierung
│   ├── components/         # React-Komponenten
│   ├── lib/               # Utilities und Konfiguration
│   └── scripts/           # Seed-Skripte
├── prisma/                # Datenbankschema und Migrationen
├── docs/                  # Dokumentation
├── .github/               # GitHub Actions
├── docker-compose.yml     # Docker-Konfiguration
├── Dockerfile            # Container-Build
└── README.md             # Hauptdokumentation
```

## Entwicklung

### Lokale Entwicklung
```bash
npm run dev          # Entwicklungsserver
npm run build        # Produktions-Build
npm run lint         # Code-Linting
npx prisma studio    # Datenbank-GUI
```

### Datenbank-Management
```bash
npx prisma migrate dev    # Neue Migration
npx prisma db seed       # Seed-Daten laden
npx prisma generate      # Client generieren
```

## Sicherheit

### Implementierte Maßnahmen
- **CSRF-Schutz** durch NextAuth.js
- **SQL-Injection-Schutz** durch Prisma ORM
- **Session-Management** mit sicheren Cookies
- **Input-Validierung** auf Client und Server
- **Admin-Bereich** mit Authentifizierung geschützt

### Empfohlene Produktionseinstellungen
- Starke `NEXTAUTH_SECRET` verwenden
- HTTPS für Produktionsumgebung
- Regelmäßige Sicherheitsupdates
- Backup-Strategie für Datenbank

## Performance

### Optimierungen
- **Server-Side Rendering** für bessere SEO
- **Image-Optimierung** durch Next.js
- **Code-Splitting** automatisch durch Next.js
- **Caching** durch TanStack Query
- **Docker Multi-Stage Builds** für kleinere Images

## Wartung

### Regelmäßige Aufgaben
- Dependency-Updates prüfen
- Sicherheitspatches einspielen
- Datenbank-Backups erstellen
- Log-Dateien überwachen
- Performance-Metriken prüfen

## Support & Weiterentwicklung

### Geplante Features
- [ ] Erweiterte Suchfilter
- [ ] Bewertungssystem für Software
- [ ] API-Dokumentation mit Swagger
- [ ] Mehrsprachigkeit (i18n)
- [ ] Advanced Analytics

### Bekannte Limitierungen
- Aktuell nur deutsche Sprache
- Keine Benutzerregistrierung (nur Admin)
- Begrenzte Anpassungsmöglichkeiten im Frontend

## Lizenz
Dieses Projekt steht unter der MIT-Lizenz. Siehe `LICENSE` Datei für Details.

## Kontakt
- Repository: https://github.com/noack-digital/software-hub
- Issues: https://github.com/noack-digital/software-hub/issues
- Dokumentation: Siehe `docs/` Verzeichnis