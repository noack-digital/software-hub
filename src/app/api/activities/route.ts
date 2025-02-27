import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching recent activities...');
    
    // Teste zuerst die Datenbankverbindung
    const softwareCount = await prisma.software.count();
    console.log('Total software count:', softwareCount);

    // Hole die letzten 5 Software-Einträge, sortiert nach Erstellungsdatum
    const recentActivities = await prisma.software.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('Recent activities fetched:', recentActivities);
    return NextResponse.json(recentActivities);
  } catch (error) {
    console.error('Detailed error in activities route:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      error
    });
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
