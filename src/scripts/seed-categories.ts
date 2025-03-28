import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting category seed process...');

    // Erstelle Kategorien
    console.log('Creating categories...');
    const categories = [
      { name: 'Kommunikation', description: 'Software für Kommunikation und Messaging' },
      { name: 'Kollaboration', description: 'Tools für die Zusammenarbeit in Teams' },
      { name: 'Medienproduktion', description: 'Software zur Erstellung und Bearbeitung von Medien' },
      { name: 'Lernmanagement', description: 'Systeme zur Verwaltung von Lernprozessen' },
      { name: 'Office', description: 'Bürosoftware und Produktivitätstools' },
      { name: 'Sonstiges', description: 'Andere Softwaretypen' },
    ];

    for (const category of categories) {
      // Prüfen, ob Kategorie bereits existiert
      const existingCategory = await prisma.category.findUnique({
        where: { name: category.name },
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: category,
        });
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category ${category.name} already exists`);
      }
    }

    console.log('Category seed completed successfully');
  } catch (error) {
    console.error('Error during category seed process:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(async (e) => {
    console.error('Error during seed execution:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
