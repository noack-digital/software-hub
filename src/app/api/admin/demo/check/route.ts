import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/demo/check - Prüfe ob DEMO-Daten geladen sind
export async function GET() {
  try {
    const softwareCount = await prisma.software.count();
    const categoryCount = await prisma.category.count();
    const targetGroupCount = await prisma.targetGroup.count();

    // Prüfe ob DEMO-Daten über die DEMO-Load-Route geladen wurden
    // Wir prüfen, ob es einen Audit-Log-Eintrag gibt, der auf DEMO-Load hinweist
    const demoAuditLog = await prisma.auditLog.findFirst({
      where: {
        action: 'IMPORT',
        model: 'Software',
        recordId: 'DEMO_LOAD'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // DEMO-Daten sind nur dann geladen, wenn:
    // 1. Software vorhanden ist UND
    // 2. Es gibt einen DEMO-Load-Audit-Log-Eintrag
    const hasDemoData = softwareCount > 0 && demoAuditLog !== null;

    return NextResponse.json({
      hasDemoData,
      counts: {
        software: softwareCount,
        categories: categoryCount,
        targetGroups: targetGroupCount
      }
    });
  } catch (error) {
    console.error('Fehler beim Prüfen der DEMO-Daten:', error);
    return NextResponse.json(
      { error: 'Fehler beim Prüfen der DEMO-Daten' },
      { status: 500 }
    );
  }
}

