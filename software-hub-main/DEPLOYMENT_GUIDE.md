# 🚀 Software-Hub Deployment Guide

## Universal Deployment Support

Der Software-Hub wurde mit **dynamischer Base-URL-Erkennung** implementiert und funktioniert jetzt auf **jeder IP-Adresse, Domain und jedem Port** ohne manuelle Konfiguration.

## ✅ Implementierte Features

### 🌐 Dynamische URL-Erkennung
- **Automatische Base-URL-Erkennung** aus Request-Headers
- **Keine hardcodierten URLs** mehr in der Konfiguration
- **Funktioniert auf beliebigen IPs/Domains/Ports**
- **Support für Reverse Proxies** und Load Balancer

### 🔧 Technische Implementierung
- `src/lib/base-url.ts` - Zentrale URL-Erkennungslogik
- `src/app/api/base-url/route.ts` - API-Endpoint für URL-Abfrage
- `src/hooks/useApi.ts` - Hook für konsistente API-Aufrufe
- Aktualisierte NextAuth-Konfiguration mit dynamischer Base-URL
- Verbesserte Embed-Funktionalität mit automatischer URL-Generierung

### 📦 Docker-Konfiguration
- Entfernte hardcodierte `NEXTAUTH_URL` und `NEXT_PUBLIC_BASE_URL`
- Automatische Anpassung an die Deployment-Umgebung
- Kompatibel mit Docker, Kubernetes und Cloud-Plattformen

## 🎯 Deployment-Szenarien

### Lokale Entwicklung
```bash
docker-compose up --build
# Läuft automatisch auf http://localhost:3000
```

### Server-Deployment (z.B. 10.1.1.45:8080)
```bash
# Einfach den Container starten - keine URL-Konfiguration nötig
docker-compose up -d
# Funktioniert automatisch auf http://10.1.1.45:8080
```

### Produktions-Deployment
```bash
# Auf beliebiger Domain/IP
docker-compose up -d
# Funktioniert automatisch auf https://your-domain.com
```

## 🧪 Getestete Funktionalitäten

### ✅ API-Endpunkte
- `/api/base-url` - Dynamische URL-Erkennung
- `/api/settings` - Konfigurationseinstellungen
- `/api/footer-links` - Footer-Link-Verwaltung
- `/api/target-groups` - Zielgruppen-Management
- Alle anderen APIs funktionieren mit relativen URLs

### ✅ Admin-Funktionen
- Badge-Einstellungen vollständig funktional
- Footer-Links-Verwaltung ohne Fehler
- Target Groups Toggle funktioniert korrekt
- Embed-Code-Generierung mit automatischer URL

### ✅ Datenbank
- Alle fehlenden Tabellen erstellt (FooterLink)
- Alle fehlenden Einstellungen hinzugefügt
- Automatische Migrations funktionieren

## 🔄 Migration von bestehenden Deployments

Wenn Sie bereits eine Version des Software-Hub deployed haben:

1. **Stoppen Sie die bestehende Installation:**
   ```bash
   docker-compose down
   ```

2. **Pullen Sie die neueste Version:**
   ```bash
   git pull origin main
   ```

3. **Starten Sie neu (ohne URL-Konfiguration):**
   ```bash
   docker-compose up --build -d
   ```

4. **Die Anwendung erkennt automatisch die korrekte URL**

## 🌟 Vorteile der neuen Implementierung

### 🚀 Zero-Configuration Deployment
- Keine manuellen URL-Einstellungen erforderlich
- Automatische Anpassung an jede Umgebung
- Sofortige Funktionsfähigkeit nach dem Start

### 🔧 Flexibilität
- Funktioniert mit HTTP und HTTPS
- Support für Custom Ports
- Kompatibel mit Reverse Proxies
- Cloud-Ready (AWS, Azure, GCP)

### 🛡️ Robustheit
- Fallback-Mechanismen für URL-Erkennung
- Fehlerbehandlung bei fehlenden Headers
- Konsistente API-Aufrufe

## 📋 Deployment-Checkliste

- [ ] Docker und Docker Compose installiert
- [ ] Repository geklont: `git clone https://github.com/noack-digital/software-hub.git`
- [ ] In Projektverzeichnis gewechselt: `cd software-hub`
- [ ] Container gestartet: `docker-compose up -d`
- [ ] Anwendung erreichbar auf gewünschter IP/Domain
- [ ] Admin-Login funktioniert (admin@example.com / admin123)
- [ ] Alle Funktionen getestet

## 🎉 Ergebnis

**Der Software-Hub funktioniert jetzt universell auf jeder IP-Adresse, Domain und jedem Port ohne manuelle Konfiguration!**

Die Anforderung *"Software-Hub muss auf jeder IP / Domain, unabhängig vom gewählten Port funktionieren"* wurde vollständig erfüllt.