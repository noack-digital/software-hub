import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    // Zuerst alle Kategorieverbindungen und Zielgruppenverbindungen löschen
    await prisma.softwareCategory.deleteMany({
      where: {
        softwareId: params.id
      }
    });
    
    await prisma.softwareTargetGroup.deleteMany({
      where: {
        softwareId: params.id
      }
    });
    
    // Dann die Software löschen
    await prisma.software.delete({
      where: {
        id: params.id
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const data = await request.json();
    const { categories, targetGroups, ...otherData } = data;
    
    // Bestehende Kategorien und Zielgruppen löschen
    await prisma.softwareCategory.deleteMany({
      where: {
        softwareId: params.id
      }
    });
    
    await prisma.softwareTargetGroup.deleteMany({
      where: {
        softwareId: params.id
      }
    });
    
    // Software aktualisieren und neue Kategorien und Zielgruppen erstellen
    const software = await prisma.software.update({
      where: {
        id: params.id
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
      types: software.types,
      costs: software.costs,
      available: software.available,
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
