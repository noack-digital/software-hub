import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Aktuelle Anzahl der Software
    const totalSoftware = await prisma.software.count();
    
    // Anzahl der Software vom letzten Monat
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthSoftware = await prisma.software.count({
      where: {
        createdAt: {
          lt: lastMonth
        }
      }
    });
    
    // Prozentuale Änderung berechnen
    const percentageChange = lastMonthSoftware === 0 
      ? 100 
      : Math.round(((totalSoftware - lastMonthSoftware) / lastMonthSoftware) * 100);

    // Alle Kategorien laden
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true
      }
    });

    // Statistiken für jede Kategorie
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        // Anzahl der Software mit dieser Kategorie
        const total = await prisma.softwareCategory.count({
          where: {
            categoryId: category.id
          }
        });

        // Anzahl der Software mit dieser Kategorie vom letzten Monat
        const lastMonthTotal = await prisma.softwareCategory.count({
          where: {
            categoryId: category.id,
            software: {
              createdAt: {
                lt: lastMonth
              }
            }
          }
        });

        // Prozentuale Änderung für diese Kategorie
        const catPercentageChange = lastMonthTotal === 0 
          ? (total > 0 ? 100 : 0) 
          : Math.round(((total - lastMonthTotal) / lastMonthTotal) * 100);

        return {
          id: category.id,
          name: category.name,
          total,
          percentageChange: catPercentageChange
        };
      })
    );

    // Sortieren nach Anzahl (absteigend)
    categoryStats.sort((a, b) => b.total - a.total);

    return NextResponse.json({
      total: totalSoftware,
      percentageChange,
      categories: categoryStats
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Statistiken:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Statistiken' },
      { status: 500 }
    );
  }
}
