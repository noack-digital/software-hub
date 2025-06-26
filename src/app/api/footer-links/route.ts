import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Alle Footer-Links abrufen
export async function GET() {
  try {
    const footerLinks = await prisma.footerLink.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json(footerLinks);
  } catch (error) {
    console.error('Fehler beim Abrufen der Footer-Links:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Footer-Links' },
      { status: 500 }
    );
  }
}

// POST - Neuen Footer-Link erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, url, order = 0 } = body;

    if (!text || !url) {
      return NextResponse.json(
        { error: 'Text und URL sind erforderlich' },
        { status: 400 }
      );
    }

    const footerLink = await prisma.footerLink.create({
      data: {
        text,
        url,
        order: parseInt(order) || 0,
        isActive: true
      }
    });

    return NextResponse.json(footerLink, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen des Footer-Links:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Footer-Links' },
      { status: 500 }
    );
  }
}

// PUT - Footer-Link aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, text, url, order, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      );
    }

    const footerLink = await prisma.footerLink.update({
      where: { id },
      data: {
        ...(text && { text }),
        ...(url && { url }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(footerLink);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Footer-Links:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Footer-Links' },
      { status: 500 }
    );
  }
}

// DELETE - Footer-Link löschen
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

    await prisma.footerLink.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Footer-Link erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Footer-Links:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Footer-Links' },
      { status: 500 }
    );
  }
}