# Software Hub - Projektdokumentation

## Projektübersicht

Dieses Repository enthält zwei Versionen des Software Hub:

1. **`software-hub/`** - Original Next.js/React Version (Referenz)
2. **`software-hub-php/`** - PHP-Port (aktive Entwicklung)

## Aktueller Stand (Januar 2026)

### PHP-Version ist vollständig eingerichtet und läuft unter:
- **Frontend:** http://sh.lokal
- **Admin-Panel:** http://sh.lokal/admin/
- **Admin-Login:** admin@example.com / admin123

### Implementierte Features:

#### Frontend (Public)
- Software-Katalog mit Karten-Ansicht (visuell identisch mit Next.js Original)
- Suche und Filter (Button-basiert, Kategorie, Zielgruppe)
- Mehrsprachigkeit (DE/EN)
- Software-Details Modal
- Responsive Design mit Animationen
- Privacy-Badges mit farbigen Dots (grün/gelb/rot)
- Absolute Badge-Positionierung (top-right)

#### Admin-Panel
- Dashboard mit Statistiken
- Software-Verwaltung (CRUD)
- Kategorien-Verwaltung (CRUD)
- Zielgruppen-Verwaltung (CRUD)
- Benutzer-Verwaltung (CRUD)
- Einstellungen (Badge, Links, DSGVO)
- **Import/Export mit Demo-Daten-Funktion**

### Technologie-Stack:
- PHP 8.4 mit PDO/MariaDB
- Apache2 mit Virtual Host (sh-lokal.conf)
- Vanilla JavaScript (kein Framework)
- CSS mit Custom Properties

## Wichtige Dateien

### Konfiguration
- `software-hub-php/config/config.php` - DB-Verbindung, App-Einstellungen
- `software-hub-php/sh-lokal.conf` - Apache Virtual Host
- `software-hub-php/.htaccess` - URL-Rewriting

### API-Endpunkte
- `/api/software.php` - Software CRUD
- `/api/categories.php` - Kategorien CRUD
- `/api/target-groups.php` - Zielgruppen CRUD
- `/api/users.php` - Benutzer CRUD
- `/api/settings.php` - Einstellungen
- `/api/stats.php` - Dashboard-Statistiken
- `/api/auth.php` - Login/Logout/Session
- `/api/demo-data.php` - Demo-Daten Import/Export

### Frontend Assets
- `assets/css/style.css` - Haupt-Styles (Teal-Farbschema)
- `assets/css/admin.css` - Admin-spezifische Styles
- `assets/js/app.js` - Frontend JavaScript
- `assets/js/admin.js` - Admin JavaScript

### Übersetzungen
- `messages/de.json` - Deutsche Übersetzungen
- `messages/en.json` - Englische Übersetzungen

## Datenbank

- **Name:** software_hub
- **Benutzer:** software_hub / SoftwareHub2024
- **Tabellen:** software, categories, target_groups, users, settings, audit_log, software_categories, software_target_groups

## Letzte Änderungen (2026-01-22)

### ✅ Redesign-Projekt abgeschlossen
Die PHP-Version wurde vollständig an das Next.js Original angepasst:

**Strukturelle Änderungen:**
- ✅ Filter von Dropdowns zu Button-Pills konvertiert
- ✅ Page Header "Software-Katalog" entfernt
- ✅ Search Bar zentriert (max-width: 600px)
- ✅ Card-Layout komplett neu strukturiert
- ✅ Badges mit absoluter Positionierung (top-right)
- ✅ Logo-Größe von 48px auf 24px reduziert
- ✅ Einzelner "Details"-Button pro Card

**Dokumentation:**
- `REDESIGN_PLAN.md` - Planungsdokument mit 6 Phasen
- `REDESIGN_IMPLEMENTATION_REPORT.md` - Vollständiger Implementierungsbericht
- `GUI_VERGLEICH.md` - CSS-Vergleichsanalyse
- `GUI_IMPLEMENTATION_REPORT.md` - CSS-Implementierung

**Backups:**
- `index.php.backup-redesign-20260122-*`
- `app.js.backup-redesign-20260122-*`
- `style.css.backup-20260122-*`

## Bekannte offene Punkte

1. Dashboard-Charts (Pie-Charts für Kategorien-Verteilung)
2. KI-Integration (Gemini API für automatische Beschreibungen)
3. Batch-Operationen im Admin (Mehrfachauswahl)
4. Embed-Konfiguration Seite

## Nützliche Befehle

```bash
# Demo-Daten laden (als Admin eingeloggt)
curl -X POST http://sh.lokal/api/demo-data.php?action=load

# Apache neu starten
sudo systemctl reload apache2

# MySQL als root
sudo mysql software_hub
```

## Hinweise für die Weiterentwicklung

- Das Original Next.js Repo unter `software-hub/` dient als Referenz
- Die PHP-Version verwendet das gleiche Datenmodell
- Übersetzungen befinden sich in `/messages/*.json`
- API-Endpunkte folgen REST-Konventionen

## Verfügbare MCP-Server und Plugins

Claude Code hat Zugriff auf folgende MCP-Server und kann diese für die Projektentwicklung nutzen:

### 1. Context7 (Plugin: context7)
**Zweck:** Dokumentation und Code-Beispiele für Bibliotheken abrufen
**Verwendung:** Aktuelle Dokumentation zu PHP, JavaScript, Libraries, etc.
**Tools:**
- `resolve-library-id` - Library-ID für Dokumentationsabfragen ermitteln
- `query-docs` - Dokumentation und Code-Beispiele abfragen

**Nützlich für:** PHP-Dokumentation, JavaScript-APIs, Framework-Referenzen

### 2. Chrome DevTools (MCP: chrome-devtools)
**Zweck:** Browser-Automatisierung und Testing
**Tools:**
- `click`, `fill`, `hover` - Interaktionen mit Webseiten
- `navigate_page`, `take_screenshot` - Navigation und Dokumentation
- `evaluate_script` - JavaScript-Ausführung
- `list_console_messages` - **Console-Logs auslesen** (statt User zu fragen!)
- `list_network_requests` - Network-Requests analysieren
- `performance_start_trace`, `performance_stop_trace` - Performance-Analyse
- `take_snapshot` - Accessibility-Tree erfassen

**Nützlich für:** Frontend-Testing, UI-Automatisierung, Performance-Checks, **Debug-Logging**

**WICHTIG:** Bei Frontend-Debugging immer `list_console_messages` nutzen, um Console-Logs direkt auszulesen, anstatt den User danach zu fragen!

### 2b. Playwright (MCP: plugin-playwright-playwright)
**Zweck:** Browser-Automatisierung mit **vollem Snapshot in jeder Antwort** (DOM/Refs für Klicks und Formulare).
**Tools:** `browser_navigate`, `browser_click`, `browser_fill_form`, `browser_snapshot`, `browser_console_messages`, …
**Wichtig:** Jede Aktion (navigate, click, …) liefert einen **Accessibility-Snapshot** mit Element-Refs (z. B. `[ref=e14]`). Damit kann der Assistent den Software Hub **selbst bedienen** (Login, Einstellungen, Formulare).
**Dokumentation:** `software-hub-php/BROWSER_AUTOMATION.md` – Ablauf, Login-Daten, typische Refs, Checkliste.

### 3. Firecrawl (MCP: firecrawl)
**Zweck:** Web Scraping und Content-Extraktion
**Tools:**
- `firecrawl_scrape` - Einzelne Seiten scrapen
- `firecrawl_search` - Web-Suche mit Scraping
- `firecrawl_map` - Website-Struktur erfassen
- `firecrawl_crawl` - Mehrere Seiten crawlen
- `firecrawl_extract` - Strukturierte Daten extrahieren
- `firecrawl_agent` - Autonome Datensammlung

**Nützlich für:** Software-Daten sammeln, Konkurrenzanalyse, Content-Import

### 4. DataForSEO (MCP: dataforseo)
**Zweck:** SEO und Marketing Analytics
**Tools:**
- Keyword-Recherche (`google_keyword_ideas`, `related_keywords`)
- SERP-Analyse (`organic_live_advanced`, `serp_competitors`)
- Backlink-Analyse (`backlinks`, `referring_domains`)
- Content-Analyse (`content_analysis_search`)
- YouTube-Daten (`youtube_organic_live_advanced`)
- Business Listings (`business_listings_search`)

**Nützlich für:** SEO-Optimierung, Keyword-Strategie, Konkurrenzanalyse

### 5. Brave Search (MCP: brave-search)
**Zweck:** Web- und Local-Suche
**Tools:**
- `brave_web_search` - Allgemeine Web-Suche
- `brave_local_search` - Lokale Business-Suche

**Nützlich für:** Recherche, Informationsbeschaffung, Software-Recherche

### 6. Perplexity (MCP: perplexity)
**Zweck:** AI-gestützte Recherche und Reasoning
**Tools:**
- `perplexity_ask` - Konversation mit Sonar API
- `perplexity_research` - Tiefgehende Recherche mit Citations
- `perplexity_reason` - Komplexes Reasoning
- `perplexity_search` - Web-Suche mit Ranking

**Nützlich für:** Best Practices recherchieren, Problemlösungen finden, Technische Recherche

### Empfohlene Einsatzszenarien für dieses Projekt:

1. **Context7:** PHP/JavaScript-Dokumentation bei Implementierungsfragen
2. **Playwright:** Software Hub im Browser selbst bedienen und prüfen (Login, Admin, Einstellungen) – siehe `software-hub-php/BROWSER_AUTOMATION.md`
3. **Chrome DevTools:** Frontend-Testing und Performance-Optimierung (falls verbunden)
4. **Firecrawl:** Software-Katalog erweitern durch Web-Scraping
5. **Perplexity:** Best Practices und Lösungsansätze recherchieren
6. **Brave Search:** Allgemeine Recherche zu Technologien/Tools
