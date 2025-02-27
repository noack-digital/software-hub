import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Starting seed process...');

    // Erstelle Admin-Benutzer
    const adminPassword = await bcrypt.hash('admin123', 10);
    console.log('Admin password hashed');
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@software-hub.local' },
      update: {},
      create: {
        email: 'admin@software-hub.local',
        name: 'Administrator',
        password: adminPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin user created:', admin.id);

    // Lösche bestehende Kategorien
    console.log('Deleting existing categories...');
    await prisma.category.deleteMany();

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
      await prisma.category.create({
        data: category,
      });
    }
    console.log(`${categories.length} categories created`);

    // Lösche bestehende Software
    console.log('Deleting existing software entries...');
    await prisma.software.deleteMany();

    // Erstelle neue Software-Einträge
    const softwareData = [
      {
        name: 'Moodle',
        url: 'https://moodle.org',
        shortDescription: 'Umfassende Lernplattform für Online-Kurse und E-Learning',
        description: 'Moodle ist eine Open-Source-Lernplattform, die es Bildungseinrichtungen ermöglicht, Online-Kurse zu erstellen und zu verwalten. Die Plattform bietet verschiedene Werkzeuge für die Zusammenarbeit und Bewertung.',
        category: 'Lernmanagement',
        type: 'Web',
        costs: 'Kostenlos',
        available: true,
        userId: admin.id,
      },
      {
        name: 'BigBlueButton',
        url: 'https://bigbluebutton.org',
        shortDescription: 'Webkonferenz-System speziell für Online-Lehre',
        description: 'BigBlueButton ist ein Open-Source-Webkonferenzsystem, das speziell für Online-Lehre entwickelt wurde. Es bietet Features wie Whiteboard, Bildschirmfreigabe und Breakout-Räume.',
        category: 'Kommunikation',
        type: 'Web',
        costs: 'Kostenlos',
        available: true,
        userId: admin.id,
      },
      {
        name: 'Microsoft Teams',
        url: 'https://www.microsoft.com/de-de/microsoft-teams/',
        shortDescription: 'Kollaborationsplattform mit Chat, Videokonferenzen und Dateiaustausch',
        description: 'Microsoft Teams ist eine Plattform für Teamarbeit, die Chat, Videokonferenzen, Dateispeicherung und Anwendungsintegration kombiniert. Es ist Teil der Microsoft 365-Familie von Produkten.',
        category: 'Kollaboration, Kommunikation',
        type: 'Web, Desktop, Mobile',
        costs: 'Abo-Modell: ab 4.20 € pro Monat',
        available: true,
        userId: admin.id,
      },
    ];

    for (const software of softwareData) {
      await prisma.software.create({
        data: software,
      });
    }

    console.log(`${softwareData.length} software entries created`);
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seed process:', error);
    throw error;
  }
}

main()
  .then(async () => {
    console.log('Disconnecting from database...');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seed execution:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
