FROM node:20-alpine

# Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package.json und installiere Abhängigkeiten
COPY package.json package-lock.json* ./
RUN npm ci

# Kopiere den Rest des Codes
COPY . .

# Mache das Setup-Skript ausführbar
RUN chmod +x ./scripts/docker-setup.sh

# Generiere Prisma Client
RUN npx prisma generate

# Setze Umgebungsvariablen
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

# Exponiere den Port
EXPOSE 3000

# Starte die Anwendung mit dem Setup-Skript
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run dev"]
