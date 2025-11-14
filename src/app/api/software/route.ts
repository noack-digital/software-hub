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
    const targetGroupId = searchParams.get('targetGroupId');
    
    // Basisabfrage mit Kategorien und Zielgruppen
    const baseQuery: any = {
      include: {
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                nameEn: true
              }
            }
          }
        },
        targetGroups: {
          select: {
            targetGroup: {
              select: {
                id: true,
                name: true,
                nameEn: true
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
          // Auch in englischen Feldern suchen
          { nameEn: { contains: searchQuery, mode: 'insensitive' } },
          { shortDescriptionEn: { contains: searchQuery, mode: 'insensitive' } },
          { descriptionEn: { contains: searchQuery, mode: 'insensitive' } },
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
    
    // Zielgruppen-Filter hinzufügen, wenn vorhanden
    if (targetGroupId) {
      // Prüfe zuerst, ob die Tabelle existiert, bevor wir den Filter anwenden
      try {
        whereClause = {
          ...whereClause,
          targetGroups: {
            some: {
              targetGroupId: targetGroupId
            }
          }
        };
        console.log('Zielgruppen-Filter angewendet:', targetGroupId);
      } catch (e) {
        console.log('targetGroups Filter konnte nicht angewendet werden:', e);
      }
    }
    
    // Abfrage ausführen
    let software;
    try {
      software = await prisma.software.findMany({
        ...baseQuery,
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      });
    } catch (error: any) {
      // Falls targetGroups nicht verfügbar ist, versuche ohne targetGroups
      if (error.code === 'P2021' || error.message?.includes('SoftwareTargetGroup') || error.message?.includes('does not exist')) {
        console.log('targetGroups Tabelle nicht gefunden, verwende Abfrage ohne targetGroups');
        const baseQueryWithoutTargetGroups = {
          include: {
            categories: baseQuery.include.categories
          },
          orderBy: baseQuery.orderBy
        };
        // Entferne targetGroups aus whereClause falls vorhanden
        const whereClauseWithoutTargetGroups: any = { ...whereClause };
        if (whereClauseWithoutTargetGroups.targetGroups) {
          delete whereClauseWithoutTargetGroups.targetGroups;
          console.log('targetGroups Filter entfernt, da Tabelle nicht existiert');
        }
        software = await prisma.software.findMany({
          ...baseQueryWithoutTargetGroups,
          where: Object.keys(whereClauseWithoutTargetGroups).length > 0 ? whereClauseWithoutTargetGroups : undefined,
        });
        // Füge leere targetGroups hinzu
        software = software.map((item: any) => ({
          ...item,
          targetGroups: []
        }));
      } else {
        throw error;
      }
    }
    
    // Daten transformieren, um das richtige Format für die Antwort zu haben
    const formattedSoftware = software.map((item: any) => ({
      id: item.id,
      name: item.name,
      shortDescription: item.shortDescription,
      description: item.description,
      url: item.url,
      logo: item.logo,
      types: item.types,
      costs: item.costs,
      available: item.available,
      // Deutsche Felder
      features: item.features,
      alternatives: item.alternatives,
      notes: item.notes,
      // Englische Übersetzungen
      nameEn: item.nameEn,
      shortDescriptionEn: item.shortDescriptionEn,
      descriptionEn: item.descriptionEn,
      featuresEn: item.featuresEn,
      alternativesEn: item.alternativesEn,
      notesEn: item.notesEn,
      categories: item.categories.map(c => ({
        id: c.category.id,
        name: c.category.name,
        nameEn: c.category.nameEn
      })),
      targetGroups: item.targetGroups && Array.isArray(item.targetGroups) ? item.targetGroups.map((tg: any) => ({
        id: tg.targetGroup?.id || tg.id,
        name: tg.targetGroup?.name || tg.name,
        nameEn: tg.targetGroup?.nameEn || tg.nameEn
      })) : []
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
    
    // Erstelle Software mit Kategorien und Zielgruppen
    const newSoftware = await prisma.software.create({
      data: {
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description || '',
        url: data.url || '',
        logo: data.logo || '',
        types: data.types || [],
        costs: data.costs || '',
        features: data.features || '',
        alternatives: data.alternatives || '',
        notes: data.notes || '',
        available: data.available || false,
        // Englische Felder
        nameEn: data.nameEn || '',
        shortDescriptionEn: data.shortDescriptionEn || '',
        descriptionEn: data.descriptionEn || '',
        featuresEn: data.featuresEn || '',
        alternativesEn: data.alternativesEn || '',
        notesEn: data.notesEn || '',
        categories: {
          create: data.categories?.map(categoryId => ({
            category: {
              connect: {
                id: categoryId
              }
            }
          })) || []
        },
        targetGroups: {
          create: data.targetGroups?.map(targetGroupId => ({
            targetGroup: {
              connect: {
                id: targetGroupId
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
      logo: newSoftware.logo,
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
    
    // Bestehende Kategorien und Zielgruppen löschen
    await prisma.softwareCategory.deleteMany({
      where: {
        softwareId: data.id
      }
    });
    
    await prisma.softwareTargetGroup.deleteMany({
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
        logo: data.logo || '',
        types: data.types || [],
        costs: data.costs || '',
        features: data.features || '',
        alternatives: data.alternatives || '',
        notes: data.notes || '',
        available: data.available || false,
        // Englische Felder
        nameEn: data.nameEn || '',
        shortDescriptionEn: data.shortDescriptionEn || '',
        descriptionEn: data.descriptionEn || '',
        featuresEn: data.featuresEn || '',
        alternativesEn: data.alternativesEn || '',
        notesEn: data.notesEn || '',
        categories: {
          create: data.categories?.map(categoryId => ({
            category: {
              connect: {
                id: categoryId
              }
            }
          })) || []
        },
        targetGroups: {
          create: data.targetGroups?.map(targetGroupId => ({
            targetGroup: {
              connect: {
                id: targetGroupId
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
        },
        targetGroups: {
          select: {
            targetGroup: {
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
      logo: updatedSoftware.logo,
      types: updatedSoftware.types,
      costs: updatedSoftware.costs,
      available: updatedSoftware.available,
      categories: updatedSoftware.categories.map(c => ({
        id: c.category.id,
        name: c.category.name
      })),
      targetGroups: updatedSoftware.targetGroups.map(tg => ({
        id: tg.targetGroup.id,
        name: tg.targetGroup.name
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
