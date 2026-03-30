# Docker Setup für Software-Hub

## Schnellstart mit Docker Compose

### 1. Repository klonen
```bash
git clone https://github.com/noack-digital/software-hub.git
cd software-hub
```

### 2. Umgebungsvariablen konfigurieren
```bash
cp .env.example .env
```

Bearbeiten Sie die `.env` Datei und passen Sie die Werte an:
- `DATABASE_URL`: Wird automatisch von Docker Compose gesetzt
- `NEXTAUTH_SECRET`: Generieren Sie einen sicheren Schlüssel
- `NEXTAUTH_URL`: Ihre Domain (z.B. https://ihr-domain.de)

### 3. Anwendung starten
```bash
# Entwicklungsumgebung
docker compose up -d

# Produktionsumgebung
docker compose -f docker-compose.prod.yml up -d
```

### 4. Datenbank initialisieren
```bash
# Warten Sie, bis die Container gestartet sind, dann:
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### 5. Zugriff
- Anwendung: http://localhost:3000
- Admin-Bereich: http://localhost:3000/admin
- Standard-Login: admin@example.com / admin123

## Manuelle Docker-Befehle

### Image erstellen
```bash
docker build -t software-hub .
```

### Container starten (mit externer Datenbank)
```bash
docker run -d \
  --name software-hub \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/database" \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  software-hub
```

## Produktionsdeployment

### Mit Docker Compose (empfohlen)
```bash
# Produktions-Compose-Datei verwenden
docker compose -f docker-compose.prod.yml up -d

# SSL-Zertifikate mit Let's Encrypt (optional)
# Siehe docs/server-setup.md für Details
```

### Umgebungsvariablen für Produktion
```bash
# .env für Produktion
DATABASE_URL="postgresql://software_hub_user:secure_password@db:5432/software_hub"
NEXTAUTH_URL="https://ihre-domain.de"
NEXTAUTH_SECRET="sehr-sicherer-produktions-schluessel"
NODE_ENV="production"
```

## Troubleshooting

### Container-Logs anzeigen
```bash
docker compose logs app
docker compose logs db
```

### Datenbank-Verbindung testen
```bash
docker compose exec db psql -U software_hub_user -d software_hub
```

### Container neu starten
```bash
docker compose restart app
```

### Volumes löschen (Achtung: Datenverlust!)
```bash
docker compose down -v
```

## Backup und Restore

### Datenbank-Backup erstellen
```bash
docker compose exec db pg_dump -U software_hub_user software_hub > backup.sql
```

### Datenbank wiederherstellen
```bash
docker compose exec -T db psql -U software_hub_user software_hub < backup.sql
```

## Performance-Optimierung

### Für Produktionsumgebung:
- Verwenden Sie `docker-compose.prod.yml`
- Konfigurieren Sie einen Reverse Proxy (nginx)
- Aktivieren Sie SSL/TLS
- Überwachen Sie Ressourcenverbrauch

### Ressourcen-Limits setzen:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'