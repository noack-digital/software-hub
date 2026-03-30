# Base-URL Konfiguration für Software-Hub

## Übersicht

Der Software-Hub ermittelt automatisch die korrekte Base-URL für Embed-Codes und andere externe Integrationen. Es gibt mehrere Methoden, wie die Base-URL bestimmt wird:

## Prioritätsreihenfolge

1. **Umgebungsvariable** (höchste Priorität)
2. **Request-Headers** (automatische Erkennung)
3. **Client-seitiger Fallback** (Browser-basiert)

## Konfigurationsmethoden

### 1. Umgebungsvariable (Empfohlen für Produktion)

Fügen Sie in Ihrer `.env.local` oder `.env` Datei hinzu:

```bash
NEXT_PUBLIC_BASE_URL=https://ihr-domain.de
```

**Beispiele:**
- Entwicklung: `NEXT_PUBLIC_BASE_URL=http://localhost:3005`
- Staging: `NEXT_PUBLIC_BASE_URL=https://staging.ihr-domain.de`
- Produktion: `NEXT_PUBLIC_BASE_URL=https://software-hub.ihr-domain.de`

### 2. Automatische Erkennung (Standard)

Wenn keine Umgebungsvariable gesetzt ist, ermittelt das System automatisch die Base-URL aus:
- `Host`-Header der HTTP-Anfrage
- `X-Forwarded-Proto`-Header (für Reverse Proxies)
- Automatische Protokoll-Erkennung (HTTP für localhost, HTTPS für andere Domains)

### 3. Client-seitiger Fallback

Als letzte Option wird `window.location.origin` im Browser verwendet.

## API-Endpunkt

Die aktuelle Base-URL kann über den API-Endpunkt abgerufen werden:

```bash
GET /api/base-url
```

**Antwort:**
```json
{
  "baseUrl": "http://localhost:3005",
  "success": true,
  "source": "headers"
}
```

## Verwendung in Embed-Codes

Die Base-URL wird automatisch in allen generierten Embed-Codes verwendet:

- **iframe-Codes**: `<iframe src="{baseUrl}/?embed=true">`
- **JavaScript-Codes**: `iframe.src = '{baseUrl}/?embed=true'`
- **WordPress-Shortcodes**: `[software_hub url="{baseUrl}/?embed=true"]`

## Troubleshooting

### Problem: Falsche URL in Embed-Codes

**Lösung 1:** Umgebungsvariable setzen
```bash
echo "NEXT_PUBLIC_BASE_URL=http://localhost:3005" >> .env.local
```

**Lösung 2:** Server neu starten
```bash
npm run dev
```

### Problem: HTTPS/HTTP-Mischung

**Lösung:** Explizite Base-URL setzen
```bash
NEXT_PUBLIC_BASE_URL=https://ihre-domain.de
```

## Deployment-Hinweise

### Docker
```dockerfile
ENV NEXT_PUBLIC_BASE_URL=https://ihre-domain.de
```

### Vercel
```bash
vercel env add NEXT_PUBLIC_BASE_URL
```

### Netlify
```bash
netlify env:set NEXT_PUBLIC_BASE_URL https://ihre-domain.de
```

## Sicherheitshinweise

- Die Base-URL wird öffentlich in Client-Code eingebettet
- Verwenden Sie immer HTTPS in Produktionsumgebungen
- Überprüfen Sie die URL-Konfiguration nach jedem Deployment

## Testen der Konfiguration

```bash
# API-Test
curl http://localhost:3005/api/base-url

# Embed-Test
curl "http://localhost:3005/admin/settings/embed"