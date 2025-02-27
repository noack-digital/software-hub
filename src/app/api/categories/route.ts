import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Alle Kategorien abrufen
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kategorien:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Kategorien' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Neue Kategorie erstellen
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
    
    // Prüfen, ob Kategorie bereits existiert
    const existingCategory = await prisma.category.findUnique({
      where: {
        name: body.name,
      },
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Eine Kategorie mit diesem Namen existiert bereits' },
        { status: 400 }
      );
    }
    
    // Neue Kategorie erstellen
    const newCategory = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description || '',
      },
    });
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen der Kategorie:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Kategorie' },
      { status: 500 }
    );
  }
}

// PATCH /api/categories - Kategorie aktualisieren
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
    
    // Prüfen, ob Kategorie existiert
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: body.id,
      },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Prüfen, ob der neue Name bereits von einer anderen Kategorie verwendet wird
    if (body.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: {
          name: body.name,
        },
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: 'Eine Kategorie mit diesem Namen existiert bereits' },
          { status: 400 }
        );
      }
    }
    
    // Kategorie aktualisieren
    const updatedCategory = await prisma.category.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        description: body.description,
      },
    });
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Kategorie:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kategorie' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories - Kategorie löschen
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
    
    // Prüfen, ob Kategorie existiert
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: id,
      },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Prüfen, ob die Kategorie noch mit Software-Einträgen verknüpft ist
    const softwareCount = await prisma.softwareCategory.count({
      where: {
        categoryId: id
      }
    });
    
    if (softwareCount > 0) {
      return NextResponse.json(
        { 
          error: 'Kategorie kann nicht gelöscht werden', 
          message: `Diese Kategorie wird von ${softwareCount} Software-Einträgen verwendet. Bitte entfernen Sie zuerst die Verknüpfungen.`
        },
        { status: 400 }
      );
    }
    
    // Kategorie löschen
    await prisma.category.delete({
      where: {
        id: id,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen der Kategorie:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Kategorie' },
      { status: 500 }
    );
  }
}
