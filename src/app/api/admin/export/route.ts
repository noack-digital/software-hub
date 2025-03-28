import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialisiere Prisma Client als globale Variable
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// GET /api/admin/export - Alle Software für Export abrufen
export async function GET(request: NextRequest) {
  try {
    // Basisabfrage mit Kategorien
    const software = await prisma.software.findMany({
      include: {
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Daten transformieren, um das richtige Format für den Export zu haben
    const exportData = software.map(item => ({
      id: item.id,
      name: item.name,
      shortDescription: item.shortDescription,
      description: item.description,
      url: item.url,
      // Array in kommagetrennten String umwandeln
      types: Array.isArray(item.types) ? item.types.join(', ') : '',
      costs: item.costs,
      available: item.available ? 'Ja' : 'Nein',
      // Kategorien als kommagetrennten String hinzufügen
      categories: item.categories.map(c => c.category.name).join(', ')
    }));
    
    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Fehler beim Abrufen der Export-Daten:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Export-Daten' },
      { status: 500 }
    );
  }
}
