import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import demoDataset from '@/data/demo-dataset.json';
import { DataPrivacyStatus } from '@prisma/client';

const normalizePrivacyStatus = (value?: string | null): DataPrivacyStatus => {
  if (
    value &&
    Object.values(DataPrivacyStatus).includes(value as DataPrivacyStatus)
  ) {
    return value as DataPrivacyStatus;
  }
  return DataPrivacyStatus.EU_HOSTED;
};

// POST /api/admin/demo/load - Lade DEMO-Datensatz
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bodyText = await request.text();
    const body = bodyText ? JSON.parse(bodyText) : null;
    const dataset = body && body.software && body.categories && body.targetGroups
      ? body
      : demoDataset;
    const { software, categories, targetGroups } = dataset;

    if (!software || !Array.isArray(software)) {
      return NextResponse.json(
        { error: 'Ungültiges Datenformat: software fehlt' },
        { status: 400 }
      );
    }

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Ungültiges Datenformat: categories fehlt' },
        { status: 400 }
      );
    }

    if (!targetGroups || !Array.isArray(targetGroups)) {
      return NextResponse.json(
        { error: 'Ungültiges Datenformat: targetGroups fehlt' },
        { status: 400 }
      );
    }

    // Lösche alle vorhandenen Daten (in der richtigen Reihenfolge wegen Foreign Keys)
    await prisma.softwareTargetGroup.deleteMany();
    await prisma.softwareCategory.deleteMany();
    await prisma.software.deleteMany();
    await prisma.targetGroup.deleteMany();
    await prisma.category.deleteMany();

    // Erstelle Kategorien zuerst
    const createdCategories = await Promise.all(
      categories.map(async (cat: any) => {
        return await prisma.category.create({
          data: {
            name: cat.name,
            description: cat.description || '',
            nameEn: cat.nameEn || '',
            descriptionEn: cat.descriptionEn || ''
          }
        });
      })
    );

    // Erstelle Zielgruppen
    const createdTargetGroups = await Promise.all(
      targetGroups.map(async (tg: any) => {
        return await prisma.targetGroup.create({
          data: {
            name: tg.name,
            description: tg.description || '',
            nameEn: tg.nameEn || '',
            descriptionEn: tg.descriptionEn || ''
          }
        });
      })
    );

    // Erstelle Mapping von Namen zu IDs
    const categoryMap = new Map(createdCategories.map(c => [c.name, c.id]));
    const targetGroupMap = new Map(createdTargetGroups.map(tg => [tg.name, tg.id]));

    // Erstelle Software-Einträge
    const createdSoftware = await Promise.all(
      software.map(async (item: any) => {
        // Finde Kategorie-IDs
        const categoryIds = item.categoryNames
          ?.map((name: string) => categoryMap.get(name))
          .filter((id: string | undefined) => id !== undefined) || [];

        // Finde Zielgruppen-IDs
        const targetGroupIds = item.targetGroupNames
          ?.map((name: string) => targetGroupMap.get(name))
          .filter((id: string | undefined) => id !== undefined) || [];

        const softwareItem = await prisma.software.create({
          data: {
            name: item.name,
            shortDescription: item.shortDescription || '',
            description: item.description || '',
            url: item.url || '',
            logo: item.logo || '',
            types: item.types || [],
            costs: item.costs || '',
            available: item.available !== undefined ? item.available : true,
            dataPrivacyStatus: normalizePrivacyStatus(item.dataPrivacyStatus),
            inhouseHosted: item.inhouseHosted ?? false,
            features: item.features || '',
            alternatives: item.alternatives || '',
            notes: item.notes || '',
            // Englische Felder
            nameEn: item.nameEn || '',
            shortDescriptionEn: item.shortDescriptionEn || '',
            descriptionEn: item.descriptionEn || '',
            featuresEn: item.featuresEn || '',
            alternativesEn: item.alternativesEn || '',
            notesEn: item.notesEn || '',
            // Kategorien und Zielgruppen verknüpfen
            categories: {
              create: categoryIds.map((categoryId: string) => ({
                category: {
                  connect: {
                    id: categoryId
                  }
                }
              }))
            },
            targetGroups: {
              create: targetGroupIds.map((targetGroupId: string) => ({
                targetGroup: {
                  connect: {
                    id: targetGroupId
                  }
                }
              }))
            }
          }
        });

        return softwareItem;
      })
    );

    // Erstelle Audit-Log-Eintrag für DEMO-Load
    await prisma.auditLog.create({
      data: {
        action: 'IMPORT',
        model: 'Software',
        recordId: 'DEMO_LOAD',
        userId: session.user.id,
        changes: JSON.stringify({ 
          type: 'DEMO',
          count: createdSoftware.length,
          categories: createdCategories.length,
          targetGroups: createdTargetGroups.length
        }),
      },
    });

    return NextResponse.json({
      message: 'DEMO-Datensatz erfolgreich geladen',
      counts: {
        software: createdSoftware.length,
        categories: createdCategories.length,
        targetGroups: createdTargetGroups.length
      }
    });
  } catch (error) {
    console.error('Fehler beim Laden des DEMO-Datensatzes:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des DEMO-Datensatzes: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler') },
      { status: 500 }
    );
  }
}

