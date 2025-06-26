import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data } = await request.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'Keine gültigen Daten zum Import gefunden' }, { status: 400 });
    }

    let imported = 0;
    const errors: string[] = [];

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all existing categories and target groups for mapping
    const categories = await prisma.category.findMany();
    const targetGroups = await prisma.targetGroup.findMany();

    for (const item of data) {
      try {
        // Validate required fields
        if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
          errors.push(`Zeile ${imported + 1}: Name ist erforderlich`);
          continue;
        }

        // Check if software already exists
        const existingSoftware = await prisma.software.findFirst({
          where: { name: item.name.trim() }
        });

        if (existingSoftware) {
          errors.push(`Software "${item.name}" existiert bereits`);
          continue;
        }

        // Prepare software data
        const softwareData: any = {
          name: item.name.trim(),
          url: item.url || '',
          shortDescription: item.shortDescription || '',
          description: item.description || '',
          costs: item.costs || '',
          available: Boolean(item.available),
          userId: user.id,
        };

        // Handle types array
        if (item.types) {
          if (Array.isArray(item.types)) {
            softwareData.types = item.types.filter(Boolean);
          } else if (typeof item.types === 'string') {
            softwareData.types = item.types.split(',').map((t: string) => t.trim()).filter(Boolean);
          }
        }

        // Create software entry
        const software = await prisma.software.create({
          data: softwareData
        });

        // Handle categories
        if (item.categories && typeof item.categories === 'string') {
          const categoryNames = item.categories.split(',').map((c: string) => c.trim()).filter(Boolean);
          
          for (const categoryName of categoryNames) {
            const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
            if (category) {
              await prisma.softwareCategory.create({
                data: {
                  softwareId: software.id,
                  categoryId: category.id
                }
              });
            }
          }
        }

        // Handle target groups
        if (item.targetGroups && typeof item.targetGroups === 'string') {
          const targetGroupNames = item.targetGroups.split(',').map((tg: string) => tg.trim()).filter(Boolean);
          
          for (const targetGroupName of targetGroupNames) {
            const targetGroup = targetGroups.find(tg => tg.name.toLowerCase() === targetGroupName.toLowerCase());
            if (targetGroup) {
              await prisma.softwareTargetGroup.create({
                data: {
                  softwareId: software.id,
                  targetGroupId: targetGroup.id
                }
              });
            }
          }
        }

        imported++;
      } catch (error) {
        console.error(`Error importing item ${item.name}:`, error);
        errors.push(`Fehler beim Import von "${item.name}": ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    }

    return NextResponse.json({
      imported,
      errors,
      message: `${imported} Einträge erfolgreich importiert${errors.length > 0 ? `, ${errors.length} Fehler` : ''}`
    });

  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler beim Import' },
      { status: 500 }
    );
  }
}