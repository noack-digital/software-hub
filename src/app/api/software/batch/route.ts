import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // Prüfe, ob spezifische IDs zum Löschen übergeben wurden
    const data = request.headers.get('content-type')?.includes('application/json') 
      ? await request.json() 
      : null;

    if (data?.ids) {
      // Lösche nur die ausgewählten Software-Einträge
      await prisma.software.deleteMany({
        where: {
          id: {
            in: data.ids
          }
        }
      });

      // Erstelle einen Audit-Log-Eintrag für selektives Löschen
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_SELECTED',
          entity: 'Software',
          entityId: 'MULTIPLE',
          changes: { 
            message: `${data.ids.length} Software-Einträge wurden gelöscht`,
            ids: data.ids 
          },
          userId: 'SYSTEM',
        },
      });
    } else {
      // Lösche alle Software-Einträge
      await prisma.software.deleteMany({});
      
      // Erstelle einen Audit-Log-Eintrag für komplettes Löschen
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_ALL',
          entity: 'Software',
          entityId: 'ALL',
          changes: { message: 'Alle Software-Einträge wurden gelöscht' },
          userId: 'SYSTEM',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in batch delete:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
