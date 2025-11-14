import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/demo/export - Exportiere aktuellen Stand als DEMO-Datensatz
export async function GET() {
  try {
    // Lade alle Software mit Kategorien und Zielgruppen
    const software = await prisma.software.findMany({
      include: {
        categories: {
          include: {
            category: true
          }
        },
        targetGroups: {
          include: {
            targetGroup: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Lade alle Kategorien
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // Lade alle Zielgruppen
    const targetGroups = await prisma.targetGroup.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // Formatiere die Daten für den Export
    const demoData = {
      software: software.map(item => ({
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        url: item.url,
        logo: item.logo,
        types: item.types,
        costs: item.costs,
        available: item.available,
        features: item.features,
        alternatives: item.alternatives,
        notes: item.notes,
        // Englische Felder
        nameEn: item.nameEn,
        shortDescriptionEn: item.shortDescriptionEn,
        descriptionEn: item.descriptionEn,
        featuresEn: item.featuresEn,
        alternativesEn: item.alternativesEn,
        notesEn: item.notesEn,
        // Kategorien und Zielgruppen als Namen (werden beim Import wieder zugeordnet)
        categoryNames: item.categories.map(c => c.category.name),
        targetGroupNames: item.targetGroups.map(tg => tg.targetGroup.name)
      })),
      categories: categories.map(cat => ({
        name: cat.name,
        description: cat.description,
        nameEn: cat.nameEn,
        descriptionEn: cat.descriptionEn
      })),
      targetGroups: targetGroups.map(tg => ({
        name: tg.name,
        description: tg.description,
        nameEn: tg.nameEn,
        descriptionEn: tg.descriptionEn
      }))
    };

    return NextResponse.json(demoData);
  } catch (error) {
    console.error('Fehler beim Exportieren des DEMO-Datensatzes:', error);
    return NextResponse.json(
      { error: 'Fehler beim Exportieren des DEMO-Datensatzes' },
      { status: 500 }
    );
  }
}

