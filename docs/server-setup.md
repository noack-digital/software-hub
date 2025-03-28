# Server-Setup für Deployment

Diese Anleitung beschreibt, wie Sie Ihren Server für das automatische Deployment des Software Hub vorbereiten.

## Voraussetzungen

- Ein Server mit Ubuntu/Debian (andere Linux-Distributionen funktionieren auch, aber die Befehle können variieren)
- Root-Zugriff oder sudo-Berechtigungen
- Öffentlich zugängliche IP-Adresse oder Domain

## 1. Docker und Docker Compose installieren

```bash
# System-Pakete aktualisieren
sudo apt update
sudo apt upgrade -y

# Abhängigkeiten installieren
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Docker GPG-Schlüssel hinzufügen
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Docker-Repository hinzufügen (für Ubuntu)
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Docker installieren
sudo apt update
sudo apt install -y docker-ce

# Aktuellen Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker $USER

# Docker Compose installieren
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Überprüfen der Installationen
docker --version
docker-compose --version
```

## 2. Projektverzeichnis erstellen

```bash
# Verzeichnis für das Projekt erstellen
mkdir -p /opt/software-hub
cd /opt/software-hub

# docker-compose.yml erstellen
cat > docker-compose.yml << 'EOL'
services:
  app:
    image: username/software-hub:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://softhub:softhub123@db:5432/software_hub
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: softhub
      POSTGRES_PASSWORD: softhub123
      POSTGRES_DB: software_hub
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
    restart: unless-stopped

volumes:
  postgres_data:
EOL

# Ersetzen Sie 'username' durch Ihren Docker Hub Benutzernamen
sed -i 's/username/IHR_DOCKERHUB_BENUTZERNAME/g' docker-compose.yml
```

## 3. SSH-Zugriff für GitHub Actions einrichten

```bash
# Verzeichnis für SSH-Schlüssel erstellen, falls es nicht existiert
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Bearbeiten der authorized_keys Datei
nano ~/.ssh/authorized_keys

# Fügen Sie hier den öffentlichen Schlüssel ein, den Sie für GitHub Actions generiert haben
# Speichern Sie die Datei mit STRG+O und beenden Sie mit STRG+X

# Berechtigungen setzen
chmod 600 ~/.ssh/authorized_keys
```

## 4. Nginx als Reverse Proxy einrichten (optional)

Wenn Sie eine Domain verwenden möchten und HTTPS aktivieren wollen:

```bash
# Nginx installieren
sudo apt install -y nginx

# Certbot für SSL-Zertifikate installieren
sudo apt install -y certbot python3-certbot-nginx

# Nginx-Konfiguration erstellen
sudo nano /etc/nginx/sites-available/software-hub

# Fügen Sie folgende Konfiguration ein:
# server {
#     listen 80;
#     server_name ihre-domain.de www.ihre-domain.de;
#
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }

# Aktivieren der Site
sudo ln -s /etc/nginx/sites-available/software-hub /etc/nginx/sites-enabled/

# Nginx-Konfiguration testen
sudo nginx -t

# Nginx neustarten
sudo systemctl restart nginx

# SSL-Zertifikat einrichten
sudo certbot --nginx -d ihre-domain.de -d www.ihre-domain.de
```

## 5. Firewall einrichten (optional, aber empfohlen)

```bash
# UFW installieren, falls nicht vorhanden
sudo apt install -y ufw

# SSH-Zugriff erlauben
sudo ufw allow ssh

# HTTP und HTTPS erlauben, wenn Sie Nginx verwenden
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Wenn Sie Nginx nicht verwenden und direkt auf den Container zugreifen:
sudo ufw allow 3000/tcp

# Mailhog Web-Interface (optional)
sudo ufw allow 8025/tcp

# Firewall aktivieren
sudo ufw enable
```

## 6. Erstes manuelles Deployment

```bash
# Zum Projektverzeichnis wechseln
cd /opt/software-hub

# Container starten
docker-compose up -d

# Logs überprüfen
docker-compose logs -f
```

Nach der Einrichtung wird GitHub Actions automatisch neue Versionen auf Ihrem Server deployen, wenn Sie Änderungen an Ihrem Repository vornehmen.
