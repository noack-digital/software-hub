import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/demo/remove - Entferne alle Daten (DEMO-Datensatz löschen)
export async function POST() {
  try {
    // Lösche alle Daten in der richtigen Reihenfolge (wegen Foreign Keys)
    await prisma.softwareTargetGroup.deleteMany();
    await prisma.softwareCategory.deleteMany();
    await prisma.software.deleteMany();
    await prisma.targetGroup.deleteMany();
    await prisma.category.deleteMany();

    return NextResponse.json({
      message: 'Alle Daten erfolgreich entfernt',
      success: true
    });
  } catch (error) {
    console.error('Fehler beim Entfernen der Daten:', error);
    return NextResponse.json(
      { error: 'Fehler beim Entfernen der Daten: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler') },
      { status: 500 }
    );
  }
}

