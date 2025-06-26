# Software Hub 🚀

Ein modernes, webbasiertes Software-Katalog-System für Unternehmen und Bildungseinrichtungen. Verwalten Sie Ihre Software-Landschaft zentral und stellen Sie sie über Embed-Codes in andere Systeme wie Moodle, TYPO3 oder WordPress zur Verfügung.

## ✨ Features

### 📊 Software-Verwaltung
- **Vollständige CRUD-Operationen** für Software-Einträge
- **Kategorisierung** und **Zielgruppen-Zuordnung**
- **Import/Export** von Software-Daten (CSV)
- **Erweiterte Suchfunktionen** und Filter
- **Verfügbarkeits-Status** mit konfigurierbaren Badges

### 🎨 Anpassbare Benutzeroberfläche
- **Responsive Design** für alle Geräte
- **Konfigurierbare Badges** (Farben, Texte, Sichtbarkeit)
- **Anpassbare Footer-Links**
- **Zielgruppen-Anzeige** (optional)

### 🔗 Embed-Funktionalität
- **Iframe-Integration** für externe Websites
- **JavaScript-Embed-Codes** für dynamische Integration
- **WordPress-Shortcodes** für einfache CMS-Integration
- **Konfigurierbare Parameter** (Header/Footer ausblenden, Filter)
- **Automatische Base-URL-Erkennung**

### 👥 Benutzer- und Rechteverwaltung
- **NextAuth.js** Integration
- **Rollenbasierte Zugriffskontrolle**
- **Admin-Dashboard** mit Statistiken
- **Aktivitäts-Protokollierung**

### 📈 Analytics & Monitoring
- **Software-Statistiken** nach Kategorien
- **Aktivitäts-Dashboard**
- **Benutzer-Aktivitäten** Tracking

## 🐳 Docker Installation (Empfohlen)

### Voraussetzungen
- Docker & Docker Compose installiert
- Git installiert

### Schnellstart

1. **Repository klonen:**
```bash
git clone https://github.com/noack-digital/software-hub.git
cd software-hub
```

2. **Umgebungsvariablen konfigurieren:**
```bash
cp .env.example .env
# Bearbeiten Sie die .env Datei nach Ihren Bedürfnissen
```

3. **Mit Docker Compose starten:**
```bash
docker-compose up -d
```

4. **Anwendung öffnen:**
- Frontend: http://localhost:3000
- Admin-Bereich: http://localhost:3000/admin

### Docker Compose Services

- **app**: Next.js Anwendung (Port 3000)
- **postgres**: PostgreSQL Datenbank (Port 5432)

## 🛠️ Manuelle Installation

### Voraussetzungen
- Node.js 18+ 
- PostgreSQL 15+
- npm oder yarn

### Installation

1. **Repository klonen:**
```bash
git clone https://github.com/noack-digital/software-hub.git
cd software-hub
```

2. **Abhängigkeiten installieren:**
```bash
npm install
```

3. **Umgebungsvariablen konfigurieren:**
```bash
cp .env.example .env
# Bearbeiten Sie die .env Datei
```

4. **Datenbank einrichten:**
```bash
npx prisma migrate deploy
npx prisma db seed
```

5. **Entwicklungsserver starten:**
```bash
npm run dev
```

## ⚙️ Konfiguration

### Umgebungsvariablen

```bash
# Datenbank
DATABASE_URL="postgresql://user:password@localhost:5432/software_hub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Base URL für Embed-Codes
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Node Environment
NODE_ENV="production"
```

### Base-URL Konfiguration

Die Base-URL für Embed-Codes wird automatisch erkannt. Für explizite Kontrolle:

```bash
# In .env setzen
NEXT_PUBLIC_BASE_URL="https://ihre-domain.de"
```

Weitere Details: [BASE_URL_CONFIG.md](BASE_URL_CONFIG.md)

## 🔗 Embed-Integration

### Iframe Integration
```html
<iframe 
  src="https://ihre-domain.de/?embed=true&hideHeader=true&hideFooter=true" 
  width="100%" 
  height="600px" 
  frameborder="0">
</iframe>
```

### JavaScript Integration
```javascript
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = 'https://ihre-domain.de/?embed=true';
  iframe.width = '100%';
  iframe.height = '600px';
  iframe.frameBorder = '0';
  document.getElementById('software-hub').appendChild(iframe);
})();
```

### WordPress Shortcode
```php
[software_hub url="https://ihre-domain.de/?embed=true" width="100%" height="600px"]
```

### Embed-Parameter

- `embed=true` - Aktiviert Embed-Modus
- `hideHeader=true` - Versteckt Header
- `hideFooter=true` - Versteckt Footer
- `categoryId=123` - Filtert nach Kategorie
- `targetGroupId=456` - Filtert nach Zielgruppe

## 📊 API Endpunkte

### Software
- `GET /api/software` - Alle Software abrufen
- `POST /api/software` - Neue Software erstellen
- `PUT /api/software/[id]` - Software aktualisieren
- `DELETE /api/software/[id]` - Software löschen

### Kategorien
- `GET /api/categories` - Alle Kategorien
- `POST /api/categories` - Neue Kategorie

### Zielgruppen
- `GET /api/target-groups` - Alle Zielgruppen
- `POST /api/target-groups` - Neue Zielgruppe

### Einstellungen
- `GET /api/settings` - Systemeinstellungen
- `PUT /api/settings` - Einstellungen aktualisieren

### Embed
- `GET /api/base-url` - Aktuelle Base-URL abrufen

## 🚀 Deployment

### Docker Production

1. **Produktions-Docker-Compose:**
```yaml
version: '3.8'
services:
  app:
    image: ghcr.io/noack-digital/software-hub:latest
    environment:
      DATABASE_URL: "postgresql://user:pass@postgres:5432/db"
      NEXTAUTH_URL: "https://ihre-domain.de"
      NEXTAUTH_SECRET: "secure-secret-key"
      NEXT_PUBLIC_BASE_URL: "https://ihre-domain.de"
```

2. **Mit Reverse Proxy (nginx):**
```nginx
server {
    listen 80;
    server_name ihre-domain.de;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Vercel Deployment

1. **Repository zu Vercel verbinden**
2. **Umgebungsvariablen setzen**
3. **PostgreSQL Datenbank verbinden**

### Traditionelles Hosting

1. **Build erstellen:**
```bash
npm run build
```

2. **Produktionsserver starten:**
```bash
npm start
```

## 🧪 Entwicklung

### Entwicklungsumgebung

```bash
# Entwicklungsserver
npm run dev

# Datenbank zurücksetzen
npx prisma migrate reset

# Prisma Studio öffnen
npx prisma studio

# Tests ausführen
npm test
```

### Projektstruktur

```
software-hub/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React Komponenten
│   ├── lib/                 # Utilities & Konfiguration
│   └── scripts/             # Datenbank Seeds
├── prisma/                  # Datenbank Schema & Migrationen
├── public/                  # Statische Assets
├── docker-compose.yml       # Docker Konfiguration
├── Dockerfile              # Container Definition
└── README.md               # Diese Datei
```

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne eine Pull Request

## 📝 Lizenz

Dieses Projekt steht unter der MIT Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/noack-digital/software-hub/issues)
- **Dokumentation**: [Wiki](https://github.com/noack-digital/software-hub/wiki)
- **Diskussionen**: [GitHub Discussions](https://github.com/noack-digital/software-hub/discussions)

## 🏗️ Roadmap

- [ ] Multi-Tenancy Support
- [ ] REST API Dokumentation (OpenAPI)
- [ ] GraphQL API
- [ ] Mobile App
- [ ] Advanced Analytics
- [ ] Plugin System
- [ ] Internationalization (i18n)

---

**Entwickelt mit ❤️ von [Noack Digital](https://github.com/noack-digital)**
