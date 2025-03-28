# Dieses Skript bereitet die Umgebung für Docker vor

# Prüfen, ob Prisma-Client generiert werden muss
Write-Host "Generiere Prisma-Client..."
npx prisma generate

# Prüfen, ob die Datenbank migriert werden muss
Write-Host "Führe Prisma-Migrationen aus..."
npx prisma migrate deploy

# Starten der Anwendung
Write-Host "Starte die Anwendung..."
npm run dev
