#!/bin/bash

# Dieses Skript bereitet die Umgebung für Docker vor

# Prüfen, ob Prisma-Client generiert werden muss
echo "Generiere Prisma-Client..."
npx prisma generate

# Prüfen, ob die Datenbank migriert werden muss
echo "Führe Prisma-Migrationen aus..."
npx prisma migrate deploy

# Starten der Anwendung
echo "Starte die Anwendung..."
npm run dev
