import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting settings seed process...');

    // Erstelle Standardeinstellungen
    console.log('Creating default settings...');
    const settings = [
      { 
        key: 'availableBadgeText', 
        value: 'Verfügbar', 
        description: 'Text, der auf dem Badge für verfügbare Software angezeigt wird' 
      },
      { 
        key: 'showBadges', 
        value: 'true', 
        description: 'Aktiviert oder deaktiviert die Anzeige von Badges (true/false)' 
      },
      { 
        key: 'badgeBackgroundColor', 
        value: '#10b981', 
        description: 'Hintergrundfarbe für Badges (HEX-Farbcode)' 
      },
      { 
        key: 'badgeTextColor', 
        value: '#ffffff', 
        description: 'Textfarbe für Badges (HEX-Farbcode)' 
      },
    ];

    for (const setting of settings) {
      // Prüfen, ob Einstellung bereits existiert
      const existingSetting = await prisma.settings.findUnique({
        where: { key: setting.key },
      });

      if (!existingSetting) {
        await prisma.settings.create({
          data: setting,
        });
        console.log(`Created setting: ${setting.key}`);
      } else {
        console.log(`Setting ${setting.key} already exists`);
      }
    }

    console.log('Settings seed completed successfully');
  } catch (error) {
    console.error('Error during settings seed process:', error);
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
