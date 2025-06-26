import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTargetGroups() {
  console.log('Seeding target groups...');

  const targetGroups = [
    {
      name: 'Lehrende',
      description: 'Software für Lehrende und Dozierende'
    },
    {
      name: 'Studierende',
      description: 'Software für Studierende'
    },
    {
      name: 'Mitarbeitende',
      description: 'Software für Mitarbeitende der Hochschule'
    }
  ];

  for (const targetGroup of targetGroups) {
    try {
      const existing = await prisma.targetGroup.findUnique({
        where: { name: targetGroup.name }
      });

      if (!existing) {
        await prisma.targetGroup.create({
          data: targetGroup
        });
        console.log(`✓ Zielgruppe "${targetGroup.name}" erstellt`);
      } else {
        console.log(`- Zielgruppe "${targetGroup.name}" existiert bereits`);
      }
    } catch (error) {
      console.error(`✗ Fehler beim Erstellen der Zielgruppe "${targetGroup.name}":`, error);
    }
  }

  console.log('Target groups seeding completed!');
}

seedTargetGroups()
  .catch((e) => {
    console.error('Error seeding target groups:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });