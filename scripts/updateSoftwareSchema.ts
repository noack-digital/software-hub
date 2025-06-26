import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateSoftwareSchema() {
  try {
    // 1. Hole alle existierenden Software-Einträge
    const allSoftware = await prisma.software.findMany()

    // 2. Aktualisiere jeden Eintrag
    for (const software of allSoftware) {
      await prisma.software.update({
        where: { id: software.id },
        data: {
          // Übertrage website zu url
          url: software.website || '',
          // Setze type basierend auf platform
          type: software.platform?.includes('Web') ? 'Web' : 'Desktop',
          // Setze Standardwerte für neue Felder
          costs: 'Nicht angegeben',
          // Übertrage isActive zu available
          available: software.isActive ?? false,
        }
      })
    }

    console.log('✅ Alle Software-Einträge wurden erfolgreich aktualisiert')
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Software-Einträge:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSoftwareSchema()
