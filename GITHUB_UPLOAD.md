# GitHub Upload Anleitung 🚀

## Schritt 1: Personal Access Token erstellen

1. Gehen Sie zu GitHub: https://github.com/settings/tokens
2. Klicken Sie auf "Generate new token" → "Generate new token (classic)"
3. Geben Sie einen Namen ein: "Software-Hub Upload"
4. Wählen Sie Ablaufzeit: "No expiration" (oder nach Bedarf)
5. Wählen Sie folgende Scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `delete_repo` (Delete repositories)
6. Klicken Sie auf "Generate token"
7. **WICHTIG:** Kopieren Sie den Token sofort (wird nur einmal angezeigt)

## Schritt 2: Repository löschen und neu erstellen

### Option A: Über GitHub Web Interface
1. Gehen Sie zu: https://github.com/noack-digital/software-hub
2. Klicken Sie auf "Settings" (ganz rechts in der Tab-Leiste)
3. Scrollen Sie nach unten zu "Danger Zone"
4. Klicken Sie auf "Delete this repository"
5. Geben Sie "noack-digital/software-hub" ein
6. Klicken Sie auf "I understand the consequences, delete this repository"

### Option B: Über GitHub CLI (falls installiert)
```bash
gh repo delete noack-digital/software-hub --confirm
```

## Schritt 3: Neues Repository erstellen

1. Gehen Sie zu: https://github.com/new
2. Repository Name: `software-hub`
3. Owner: `noack-digital`
4. Description: `🚀 Modern Software Management Portal for Educational Institutions - Docker Ready`
5. Visibility: `Public` (oder Private nach Bedarf)
6. **NICHT** initialisieren mit README, .gitignore oder License (haben wir bereits)
7. Klicken Sie auf "Create repository"

## Schritt 4: Lokales Repository mit GitHub verbinden

```bash
cd /home/alex/Desktop/software-hub

# Remote URL aktualisieren (falls nötig)
git remote set-url origin https://github.com/noack-digital/software-hub.git

# Mit Personal Access Token pushen
git push -u origin main
```

**Bei der Passwort-Abfrage:**
- Username: `noack-digital`
- Password: `[IHR_PERSONAL_ACCESS_TOKEN]`

## Schritt 5: Repository-Einstellungen konfigurieren

Nach dem Upload:

1. Gehen Sie zu: https://github.com/noack-digital/software-hub
2. Klicken Sie auf "Settings"
3. Unter "General":
   - Description: `🚀 Modern Software Management Portal for Educational Institutions - Docker Ready`
   - Website: `https://github.com/noack-digital/software-hub`
   - Topics: `nextjs`, `docker`, `postgresql`, `education`, `software-management`, `typescript`, `prisma`
4. Unter "Pages" (falls GitHub Pages gewünscht):
   - Source: `Deploy from a branch`
   - Branch: `main` / `/ (root)`

## Schritt 6: Release erstellen (Optional)

1. Gehen Sie zu: https://github.com/noack-digital/software-hub/releases
2. Klicken Sie auf "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `🚀 Software-Hub v1.0 - Production Ready`
5. Description:
```markdown
## 🎉 First Production Release

### ✨ Features
- Complete Docker containerization with PostgreSQL 16
- Full CRUD operations for software management
- Admin panel with user/role management
- Configurable badges and footer links
- Import/Export functionality (CSV)
- Embed functionality for external websites
- Responsive design with search and filtering

### 🔧 Technical Stack
- Next.js 15 with App Router
- TypeScript for type safety
- Prisma ORM with automatic migrations
- NextAuth.js authentication
- Tailwind CSS + Shadcn/ui components
- Docker Compose for easy deployment

### 🚀 Quick Start
```bash
git clone https://github.com/noack-digital/software-hub.git
cd software-hub
docker-compose up -d
```

Visit http://localhost:3000 to get started!
```

6. Klicken Sie auf "Publish release"

## Troubleshooting

### Problem: "Authentication failed"
- Stellen Sie sicher, dass Sie den Personal Access Token als Passwort verwenden
- Überprüfen Sie, dass der Token die richtigen Scopes hat

### Problem: "Repository already exists"
- Löschen Sie das alte Repository zuerst (Schritt 2)
- Oder verwenden Sie `git push --force` (VORSICHT: überschreibt alles)

### Problem: "Permission denied"
- Überprüfen Sie, dass Sie Owner/Admin des Repositories sind
- Stellen Sie sicher, dass der Token nicht abgelaufen ist

## Fertig! 🎉

Nach erfolgreichem Upload sollte das Repository unter https://github.com/noack-digital/software-hub verfügbar sein mit:

- ✅ Vollständiger Quellcode
- ✅ Docker-Konfiguration
- ✅ Umfassende README
- ✅ MIT-Lizenz
- ✅ Produktionsreife Dokumentation

Das Repository ist jetzt bereit für:
- Klonen und lokale Entwicklung
- Docker-Deployment
- Beiträge von anderen Entwicklern
- Integration in CI/CD-Pipelines