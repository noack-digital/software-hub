import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Zuerst alle Kategorieverbindungen löschen
    await prisma.softwareCategory.deleteMany({
      where: {
        softwareId: context.params.id
      }
    });
    
    // Dann die Software löschen
    await prisma.software.delete({
      where: {
        id: context.params.id
      }
    });

    return NextResponse.json({ message: 'Software erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Software:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Software' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { categories, targetGroups, ...otherData } = data;
    
    // Bestehende Kategorien und Zielgruppen löschen
    await prisma.softwareCategory.deleteMany({
      where: {
        softwareId: context.params.id
      }
    });
    
    await prisma.softwareTargetGroup.deleteMany({
      where: {
        softwareId: context.params.id
      }
    });
    
    // Software aktualisieren und neue Kategorien und Zielgruppen erstellen
    const software = await prisma.software.update({
      where: {
        id: context.params.id
      },
      data: {
        ...otherData,
        categories: {
          create: categories?.map(categoryId => ({
            category: {
              connect: {
                id: categoryId
              }
            }
          })) || []
        },
        targetGroups: {
          create: targetGroups?.map(targetGroupId => ({
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
      id: software.id,
      name: software.name,
      shortDescription: software.shortDescription,
      description: software.description,
      url: software.url,
      logo: software.logo,
      types: software.types,
      costs: software.costs,
      available: software.available,
      // Englische Felder
      nameEn: software.nameEn,
      shortDescriptionEn: software.shortDescriptionEn,
      descriptionEn: software.descriptionEn,
      featuresEn: software.featuresEn,
      alternativesEn: software.alternativesEn,
      notesEn: software.notesEn,
      features: software.features,
      alternatives: software.alternatives,
      notes: software.notes,
      categories: software.categories.map(c => ({
        id: c.category.id,
        name: c.category.name
      })),
      targetGroups: software.targetGroups.map(tg => ({
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
