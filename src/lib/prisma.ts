import { PrismaClient } from '@prisma/client';

// Vermeiden Sie mehrere Instanzen des Prisma-Clients im Entwicklungsmodus
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

// PrismaClient ist an globalThis angehängt, um mehrere Instanzen während der Hot-Reloads zu vermeiden
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Wenn wir nicht in Produktion sind, fügen wir prisma zu globalThis hinzu
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
