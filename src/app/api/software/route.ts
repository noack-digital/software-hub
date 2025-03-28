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

// GET /api/software - Alle Software abrufen oder nach Suchbegriff filtern
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    
    // Basisabfrage mit Kategorien
    const baseQuery = {
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
    };
    
    // Suchfilter hinzufügen, wenn vorhanden
    let whereClause = {};
    
    if (searchQuery) {
      whereClause = {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { shortDescription: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
        ],
      };
    }
    
    // Kategoriefilter hinzufügen, wenn vorhanden
    if (categoryId) {
      whereClause = {
        ...whereClause,
        categories: {
          some: {
            categoryId: categoryId
          }
        }
      };
      
      console.log('Kategorie-Filter angewendet:', categoryId);
    }
    
    // Abfrage ausführen
    const software = await prisma.software.findMany({
      ...baseQuery,
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    });
    
    // Daten transformieren, um das richtige Format für die Antwort zu haben
    const formattedSoftware = software.map(item => ({
      id: item.id,
      name: item.name,
      shortDescription: item.shortDescription,
      description: item.description,
      url: item.url,
      types: item.types,
      costs: item.costs,
      available: item.available,
      categories: item.categories.map(c => ({
        id: c.category.id,
        name: c.category.name
      }))
    }));
    
    return NextResponse.json(formattedSoftware);
  } catch (error) {
    console.error('Fehler beim Abrufen der Software:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Software' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung
    if (!data.name || !data.shortDescription) {
      return NextResponse.json(
        { error: 'Name und Kurzbeschreibung sind erforderlich' },
        { status: 400 }
      );
    }
    
    // Erstelle Software mit Kategorien
    const newSoftware = await prisma.software.create({
      data: {
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description || '',
        url: data.url || '',
        types: data.types || [],
        costs: data.costs || '',
        available: data.available || false,
        categories: {
          create: data.categories?.map(categoryId => ({
            category: {
              connect: {
                id: categoryId
              }
            }
          })) || []
        }
      },
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
      }
    });
    
    // Formatiere die Antwort
    const formattedSoftware = {
      id: newSoftware.id,
      name: newSoftware.name,
      shortDescription: newSoftware.shortDescription,
      description: newSoftware.description,
      url: newSoftware.url,
      types: newSoftware.types,
      costs: newSoftware.costs,
      available: newSoftware.available,
      categories: newSoftware.categories.map(c => ({
        id: c.category.id,
        name: c.category.name
      }))
    };
    
    return NextResponse.json(formattedSoftware, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen der Software:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Software' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung
    if (!data.id || !data.name || !data.shortDescription) {
      return NextResponse.json(
        { error: 'ID, Name und Kurzbeschreibung sind erforderlich' },
        { status: 400 }
      );
    }
    
    // Prüfen, ob die Software existiert
    const existingSoftware = await prisma.software.findUnique({
      where: {
        id: data.id
      }
    });
    
    if (!existingSoftware) {
      return NextResponse.json(
        { error: 'Software nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Bestehende Kategorien löschen und neue erstellen
    await prisma.softwareCategory.deleteMany({
      where: {
        softwareId: data.id
      }
    });
    
    // Software aktualisieren
    const updatedSoftware = await prisma.software.update({
      where: {
        id: data.id
      },
      data: {
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description || '',
        url: data.url || '',
        types: data.types || [],
        costs: data.costs || '',
        available: data.available || false,
        categories: {
          create: data.categories?.map(categoryId => ({
            category: {
              connect: {
                id: categoryId
              }
            }
          })) || []
        }
      },
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
      }
    });
    
    // Formatiere die Antwort
    const formattedSoftware = {
      id: updatedSoftware.id,
      name: updatedSoftware.name,
      shortDescription: updatedSoftware.shortDescription,
      description: updatedSoftware.description,
      url: updatedSoftware.url,
      types: updatedSoftware.types,
      costs: updatedSoftware.costs,
      available: updatedSoftware.available,
      categories: updatedSoftware.categories.map(c => ({
        id: c.category.id,
        name: c.category.name
      }))
    };
    
    return NextResponse.json(formattedSoftware);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Software:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Software' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    // Prüfen, ob die Software existiert
    const existingSoftware = await prisma.software.findUnique({
      where: {
        id: id
      }
    });
    
    if (!existingSoftware) {
      return NextResponse.json(
        { error: 'Software nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Zuerst alle Kategorieverbindungen löschen
    await prisma.softwareCategory.deleteMany({
      where: {
        softwareId: id
      }
    });
    
    // Dann die Software löschen
    await prisma.software.delete({
      where: {
        id: id
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen der Software:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Software' },
      { status: 500 }
    );
  }
}
