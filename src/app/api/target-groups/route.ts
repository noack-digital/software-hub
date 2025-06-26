import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/target-groups - Alle Zielgruppen abrufen
export async function GET() {
  try {
    const targetGroups = await prisma.targetGroup.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(targetGroups);
  } catch (error) {
    console.error('Fehler beim Abrufen der Zielgruppen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Zielgruppen' },
      { status: 500 }
    );
  }
}

// POST /api/target-groups - Neue Zielgruppe erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validierung
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }
    
    // Prüfen, ob Zielgruppe bereits existiert
    const existingTargetGroup = await prisma.targetGroup.findUnique({
      where: {
        name: body.name,
      },
    });
    
    if (existingTargetGroup) {
      return NextResponse.json(
        { error: 'Eine Zielgruppe mit diesem Namen existiert bereits' },
        { status: 400 }
      );
    }
    
    // Neue Zielgruppe erstellen
    const newTargetGroup = await prisma.targetGroup.create({
      data: {
        name: body.name,
        description: body.description || '',
      },
    });
    
    return NextResponse.json(newTargetGroup, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen der Zielgruppe:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Zielgruppe' },
      { status: 500 }
    );
  }
}

// PATCH /api/target-groups - Zielgruppe aktualisieren
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validierung
    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: 'ID und Name sind erforderlich' },
        { status: 400 }
      );
    }
    
    // Prüfen, ob Zielgruppe existiert
    const existingTargetGroup = await prisma.targetGroup.findUnique({
      where: {
        id: body.id,
      },
    });
    
    if (!existingTargetGroup) {
      return NextResponse.json(
        { error: 'Zielgruppe nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Prüfen, ob der neue Name bereits von einer anderen Zielgruppe verwendet wird
    if (body.name !== existingTargetGroup.name) {
      const nameExists = await prisma.targetGroup.findUnique({
        where: {
          name: body.name,
        },
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: 'Eine Zielgruppe mit diesem Namen existiert bereits' },
          { status: 400 }
        );
      }
    }
    
    // Zielgruppe aktualisieren
    const updatedTargetGroup = await prisma.targetGroup.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        description: body.description,
      },
    });
    
    return NextResponse.json(updatedTargetGroup);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Zielgruppe:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Zielgruppe' },
      { status: 500 }
    );
  }
}

// DELETE /api/target-groups - Zielgruppe löschen
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
    
    // Prüfen, ob Zielgruppe existiert
    const existingTargetGroup = await prisma.targetGroup.findUnique({
      where: {
        id: id,
      },
    });
    
    if (!existingTargetGroup) {
      return NextResponse.json(
        { error: 'Zielgruppe nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Prüfen, ob die Zielgruppe noch mit Software-Einträgen verknüpft ist
    const softwareCount = await prisma.softwareTargetGroup.count({
      where: {
        targetGroupId: id
      }
    });
    
    if (softwareCount > 0) {
      return NextResponse.json(
        { 
          error: 'Zielgruppe kann nicht gelöscht werden', 
          message: `Diese Zielgruppe wird von ${softwareCount} Software-Einträgen verwendet. Bitte entfernen Sie zuerst die Verknüpfungen.`
        },
        { status: 400 }
      );
    }
    
    // Zielgruppe löschen
    await prisma.targetGroup.delete({
      where: {
        id: id,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen der Zielgruppe:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Zielgruppe' },
      { status: 500 }
    );
  }
}