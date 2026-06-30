# Software Hub

Ein webbasiertes Software-Verzeichnis für Hochschulen und Organisationen. Entwickelt für die HNEE (Hochschule für nachhaltige Entwicklung Eberswalde).

## Features

- **Software-Katalog** mit Detailseiten, Suchfunktion und Filtern (Kategorien, Zielgruppen, Abteilungen)
- **Mehrsprachigkeit** (Deutsch/Englisch) mit KI-gestützter Übersetzung (Gemini/Mistral)
- **KI-Integration**: Automatische Beschreibungsgenerierung, Übersetzung, Optimierung
- **Datenschutz-Ampel** (5 Stufen) und Hosting-Standort (HNEE, DE, EU, Nicht-EU)
- **Rich-Text-Editor** (Quill) für Beschreibungsfelder
- **PDF-Steckbriefe** Upload mit Vorschau und Download
- **Benutzerkonto-Antragsformular** mit konfigurierbarem E-Mail-Empfänger
- **Software-Vorschläge** über ein öffentliches Formular im Frontend; Moderation und Freigabe im Admin-Bereich
- **Admin-Backend** mit Dashboard, Benutzerverwaltung, Branding-Einstellungen
- **Batch-Operationen** (Übersetzen, Optimieren, Löschen)
- **Docker-basiert** (PHP 8.3 + Apache, MariaDB 10.11)

## Voraussetzungen

- Docker & Docker Compose
- Reverse Proxy (z.B. nginx) für HTTPS (empfohlen)

## Installation

### 1. Repository klonen

```bash
git clone https://github.com/noack-digital/software-hub.git
cd software-hub
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
# .env bearbeiten und sichere Passwörter setzen
```

### 3. Container starten

```bash
docker compose up -d --build
```

Die Anwendung ist unter `http://localhost:8080` erreichbar.

### 4. Datenbank-Migrationen (bei Updates)

Bei bestehenden Installationen neue SQL-Migrationen ausführen:

```bash
docker compose exec -T db mariadb -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < software-hub-main/software-hub-php/migrations/001_software_submissions.sql
docker compose exec -T db mariadb -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < software-hub-main/software-hub-php/migrations/002_fix_submission_departments_collation.sql
```

### 5. Erstanmeldung

Standard-Login nach der Installation:
- **E-Mail:** admin@example.com
- **Passwort:** Admin2024!

> ⚠️ Bitte nach der ersten Anmeldung das Passwort ändern!

## Konfiguration

### Umgebungsvariablen (.env)

| Variable | Beschreibung | Standard |
|----------|-------------|----------|
| `DB_ROOT_PASSWORD` | MariaDB Root-Passwort | `rootpassword` |
| `DB_NAME` | Datenbankname | `software_hub` |
| `DB_USER` | Datenbank-Benutzer | `software_hub` |
| `DB_PASS` | Datenbank-Passwort | `SoftwareHub2024` |
| `APP_URL` | Öffentliche URL der Anwendung | `http://sh.lokal` |

### KI-Konfiguration

Unter **Einstellungen → KI** im Admin-Backend:
- Google Gemini API Key oder Mistral API Key hinterlegen
- KI-Provider auswählen
- Optimierungs-Prompt anpassen

### Eingereichte Software (Admin)

Unter **Eingereichte Software** im Admin-Menü:
- Offene Vorschläge werden mit einem roten Badge angezeigt
- Einreichungen bearbeiten, in der Vorschau prüfen, freigeben oder ablehnen
- Bei Freigabe wird automatisch ein neuer Software-Katalogeintrag angelegt

### Branding

Unter **Einstellungen → Branding**:
- Logo und Favicon hochladen
- Anwendungsname ändern
- Hintergrundfarbe des Frontends anpassen
- Schriftart konfigurieren

## Projektstruktur

```
├── docker-compose.yml          # Docker-Orchestrierung
├── .env.example                # Umgebungsvariablen-Vorlage
├── schema.sql                  # Datenbank-Schema
└── software-hub-main/
    └── software-hub-php/
        ├── Dockerfile          # PHP/Apache Container
        ├── index.php           # Frontend (öffentlich)
        ├── admin/              # Admin-Backend
        ├── api/                # REST API
        ├── assets/             # CSS, JS
        ├── config/             # Konfiguration
        ├── includes/           # PHP-Klassen & Hilfsfunktionen
        ├── messages/           # Übersetzungsdateien (de.json, en.json)
        └── uploads/            # Hochgeladene Dateien
```

## Technologie-Stack

- **Backend:** PHP 8.3, Apache, MariaDB 10.11
- **Frontend:** Vanilla JS, CSS (kein Framework)
- **Editor:** Quill 2.0
- **KI:** Google Gemini / Mistral API
- **Container:** Docker & Docker Compose

## Lizenz

MIT
