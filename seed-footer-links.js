const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedFooterLinks() {
  try {
    console.log('Seeding footer links...');

    // Erstelle Standard-Footer-Links
    const footerLinks = [
      {
        text: 'Impressum',
        url: '/impressum',
        order: 1,
        isActive: true
      },
      {
        text: 'Datenschutz',
        url: '/datenschutz',
        order: 2,
        isActive: true
      },
      {
        text: 'GitHub',
        url: 'https://github.com/noack-digital/software-hub',
        order: 3,
        isActive: true
      }
    ];

    for (const link of footerLinks) {
      const existingLink = await prisma.footerLink.findFirst({
        where: { text: link.text }
      });

      if (!existingLink) {
        await prisma.footerLink.create({
          data: link
        });
        console.log(`✓ Footer-Link "${link.text}" erstellt`);
      } else {
        console.log(`- Footer-Link "${link.text}" existiert bereits`);
      }
    }

    console.log('Footer-Links erfolgreich erstellt!');
  } catch (error) {
    console.error('Fehler beim Erstellen der Footer-Links:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFooterLinks();