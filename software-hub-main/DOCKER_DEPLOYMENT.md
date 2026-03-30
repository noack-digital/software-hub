# Docker Deployment Guide

## 🎉 Erfolgreiche Docker-Konfiguration

Das Software-Hub-Projekt ist jetzt vollständig für Docker-Deployment konfiguriert und läuft erfolgreich!

## ✅ Was funktioniert

### Container Status
- **software-hub-app**: Läuft auf Port 3000 ✅
- **software-hub-db**: PostgreSQL 16 läuft auf Port 5432 ✅

### Funktionalitäten
- ✅ Next.js 15 Anwendung läuft erfolgreich
- ✅ PostgreSQL-Datenbank mit allen Migrationen
- ✅ Prisma ORM funktioniert korrekt
- ✅ API-Endpunkte sind erreichbar
- ✅ Automatische Datenbankmigrationen beim Start
- ✅ Intelligentes Seeding (überspringt bei vorhandenen Daten)
- ✅ Multi-Stage Docker Build für optimale Performance

## 🚀 Deployment-Befehle

### Erstmaliges Setup
```bash
# Container erstellen und starten
sudo docker-compose up --build -d

# Status überprüfen
sudo docker-compose ps

# Logs anzeigen
sudo docker-compose logs app
sudo docker-compose logs postgres
```

### Tägliche Nutzung
```bash
# Container starten
sudo docker-compose up -d

# Container stoppen
sudo docker-compose down

# Container neu starten
sudo docker-compose restart
```

### Wartung
```bash
# Alle Container und Volumes entfernen (Achtung: Datenverlust!)
sudo docker-compose down -v

# Nur Container entfernen (Daten bleiben erhalten)
sudo docker-compose down

# Images neu erstellen
sudo docker-compose build --no-cache
```

## 🌐 Zugriff

- **Anwendung**: http://localhost:3000
- **Datenbank**: localhost:5432
  - Database: `software_hub`
  - User: `software_hub_user`
  - Password: `software_hub_password`

## 📁 Wichtige Dateien

### Docker-Konfiguration
- `Dockerfile`: Multi-Stage Build für optimale Container-Größe
- `docker-compose.yml`: Orchestrierung von App und Datenbank
- `.dockerignore`: Ausschluss unnötiger Dateien

### Umgebungsvariablen
Die Anwendung verwendet folgende Umgebungsvariablen im Container:
- `DATABASE_URL`: PostgreSQL-Verbindung
- `NEXTAUTH_URL`: http://localhost:3000
- `NEXTAUTH_SECRET`: Sicherheitsschlüssel
- `NEXT_PUBLIC_BASE_URL`: http://localhost:3000
- `NODE_ENV`: production

## 🔧 Technische Details

### Docker-Features
- **Multi-Stage Build**: Optimierte Container-Größe
- **Health Checks**: Automatische Überwachung der Datenbankverbindung
- **Dependency Management**: App wartet auf gesunde Datenbank
- **Volume Persistence**: Daten bleiben bei Container-Neustarts erhalten
- **Network Isolation**: Sichere Kommunikation zwischen Containern

### Automatisierte Prozesse
1. **Prisma Migrationen**: Werden automatisch beim Start angewendet
2. **Database Seeding**: Läuft nur bei leerer Datenbank
3. **Next.js Build**: Optimierte Production-Build im Container
4. **Prisma Client**: Wird automatisch generiert

## 🛠️ Troubleshooting

### Container startet nicht
```bash
# Logs überprüfen
sudo docker-compose logs app
sudo docker-compose logs postgres

# Container-Status prüfen
sudo docker-compose ps
```

### Datenbankprobleme
```bash
# Datenbank-Logs anzeigen
sudo docker-compose logs postgres

# In Datenbank-Container einloggen
sudo docker-compose exec postgres psql -U software_hub_user -d software_hub
```

### Port-Konflikte
Falls Port 3000 oder 5432 bereits belegt sind, können Sie die Ports in der `docker-compose.yml` ändern:
```yaml
ports:
  - "3001:3000"  # Für die App
  - "5433:5432"  # Für die Datenbank
```

## 🎯 Produktions-Deployment

Für Produktionsumgebungen:

1. **Umgebungsvariablen anpassen**:
   - `NEXTAUTH_URL` auf echte Domain setzen
   - `NEXT_PUBLIC_BASE_URL` auf echte Domain setzen
   - `NEXTAUTH_SECRET` mit sicherem Wert ersetzen

2. **SSL/HTTPS konfigurieren**:
   - Reverse Proxy (nginx/Apache) vor die Container setzen
   - SSL-Zertifikate einrichten

3. **Datenbank-Sicherheit**:
   - Starke Passwörter verwenden
   - Datenbank-Port nicht öffentlich exponieren
   - Regelmäßige Backups einrichten

## 📊 Performance

Die aktuelle Konfiguration bietet:
- **Schnelle Startzeiten**: Multi-Stage Build reduziert Container-Größe
- **Optimierte Builds**: Next.js Production-Build mit allen Optimierungen
- **Effiziente Datenbank**: PostgreSQL 16 mit Health Checks
- **Automatische Skalierung**: Bereit für Docker Swarm oder Kubernetes

## ✨ Nächste Schritte

Das Software-Hub-Projekt ist jetzt vollständig containerisiert und produktionsbereit! Sie können:

1. **GitHub Repository erstellen** und Code hochladen
2. **CI/CD Pipeline** einrichten für automatische Deployments
3. **Monitoring** hinzufügen (Prometheus, Grafana)
4. **Load Balancing** für Hochverfügbarkeit konfigurieren
5. **Backup-Strategien** für die Datenbank implementieren

---

**Status**: ✅ Vollständig funktionsfähig und getestet
**Letzte Aktualisierung**: 27. Juni 2025
**Docker Version**: Getestet mit Docker Compose v2