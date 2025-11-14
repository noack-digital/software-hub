import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await request.json();

    // Validiere die Daten
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Ungültiges Datenformat" },
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Keine Daten zum Importieren gefunden" },
        { status: 400 }
      );
    }

    // Erstelle einen Audit-Log-Eintrag
    const auditLog = await prisma.auditLog.create({
      data: {
        action: "IMPORT",
        model: "Software",
        recordId: "BULK_IMPORT",
        userId: session.user.id,
        changes: JSON.stringify({ count: data.length }),
      },
    });

    // Lade alle Kategorien für Mapping
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase().trim(), c.id]));
    
    // Lade alle Zielgruppen für Mapping
    const targetGroups = await prisma.targetGroup.findMany();
    const targetGroupMap = new Map(targetGroups.map(tg => [tg.name.toLowerCase().trim(), tg.id]));

    // Importiere die Daten mit Fehlerbehandlung
    const importedSoftware = [];
    const errors: string[] = [];

    console.log(`Starte Import von ${data.length} Einträgen`);
    console.log('Erster Eintrag:', JSON.stringify(data[0], null, 2));

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      try {
        // Debug: Zeige Item-Struktur für erste Zeile
        if (i === 0) {
          console.log('Item-Struktur:', Object.keys(item));
          console.log('Item-Werte:', item);
        }
        
        // Validiere Name (Pflichtfeld) - prüfe verschiedene mögliche Feldnamen
        const nameValue = item.name || item.Name || item.NAME || '';
        if (!nameValue || nameValue.trim() === '') {
          errors.push(`Zeile ${i + 2}: Name fehlt (gefunden: ${JSON.stringify(Object.keys(item))})`);
          continue;
        }
        
        // Verwende den gefundenen Namen
        item.name = nameValue.trim();

        // Finde Kategorie-IDs basierend auf Namen
        const categoryIds: string[] = [];
        let categoryNamesToProcess: string[] = [];
        
        // Prüfe verschiedene mögliche Feldnamen
        if (item.categoryNames && Array.isArray(item.categoryNames)) {
          categoryNamesToProcess = item.categoryNames;
        } else if (item.categories) {
          if (typeof item.categories === 'string') {
            categoryNamesToProcess = item.categories.split(',').map((c: string) => c.trim()).filter((c: string) => c);
          } else if (Array.isArray(item.categories)) {
            categoryNamesToProcess = item.categories.map((c: string) => c.trim()).filter((c: string) => c);
          }
        }
        
        // Debug-Logging für Kategorien
        if (categoryNamesToProcess.length > 0) {
          console.log(`Zeile ${i + 2}: Kategorien gefunden:`, categoryNamesToProcess);
        }
        
        for (const categoryName of categoryNamesToProcess) {
          if (categoryName && categoryName.trim()) {
            const categoryId = categoryMap.get(categoryName.toLowerCase().trim());
            if (categoryId) {
              categoryIds.push(categoryId);
              console.log(`  -> Kategorie "${categoryName}" zu ID "${categoryId}" gemappt`);
            } else {
              console.warn(`  -> Kategorie "${categoryName}" nicht gefunden in Datenbank`);
              // Liste verfügbare Kategorien für Debugging
              console.warn(`  Verfügbare Kategorien:`, Array.from(categoryMap.keys()));
            }
          }
        }

        // Finde Zielgruppen-IDs basierend auf Namen
        const targetGroupIds: string[] = [];
        let targetGroupNamesToProcess: string[] = [];
        
        // Prüfe verschiedene mögliche Feldnamen
        if (item.targetGroupNames && Array.isArray(item.targetGroupNames)) {
          targetGroupNamesToProcess = item.targetGroupNames;
        } else if (item.targetGroups) {
          if (typeof item.targetGroups === 'string') {
            targetGroupNamesToProcess = item.targetGroups.split(',').map((tg: string) => tg.trim()).filter((tg: string) => tg);
          } else if (Array.isArray(item.targetGroups)) {
            targetGroupNamesToProcess = item.targetGroups.map((tg: string) => tg.trim()).filter((tg: string) => tg);
          }
        }
        
        // Debug-Logging für Zielgruppen
        if (targetGroupNamesToProcess.length > 0) {
          console.log(`Zeile ${i + 2}: Zielgruppen gefunden:`, targetGroupNamesToProcess);
        }
        
        for (const targetGroupName of targetGroupNamesToProcess) {
          if (targetGroupName && targetGroupName.trim()) {
            const targetGroupId = targetGroupMap.get(targetGroupName.toLowerCase().trim());
            if (targetGroupId) {
              targetGroupIds.push(targetGroupId);
              console.log(`  -> Zielgruppe "${targetGroupName}" zu ID "${targetGroupId}" gemappt`);
            } else {
              console.warn(`  -> Zielgruppe "${targetGroupName}" nicht gefunden in Datenbank`);
              // Liste verfügbare Zielgruppen für Debugging
              console.warn(`  Verfügbare Zielgruppen:`, Array.from(targetGroupMap.keys()));
            }
          }
        }

        // Konvertiere types
        let types: string[] = [];
        if (item.types) {
          if (Array.isArray(item.types)) {
            types = item.types;
          } else if (typeof item.types === 'string') {
            types = item.types.split(',').map((t: string) => t.trim()).filter((t: string) => t);
          }
        }

        // Konvertiere available
        let available = true;
        if (item.available !== undefined && item.available !== null) {
          if (typeof item.available === 'string') {
            available = item.available.toLowerCase() === 'ja' || item.available.toLowerCase() === 'true';
          } else {
            available = Boolean(item.available);
          }
        }

        // Erstelle Software-Eintrag
        const software = await prisma.software.create({
          data: {
            name: item.name,
            shortDescription: (item.shortDescription || '').trim(),
            description: (item.description || '').trim(),
            url: (item.url || '').trim(),
            logo: (item.logo || '').trim(),
            types: types,
            costs: (item.costs || '').trim(),
            available: available,
            features: (item.features || '').trim(),
            alternatives: (item.alternatives || '').trim(),
            notes: (item.notes || '').trim(),
            // Englische Felder
            nameEn: (item.nameEn || '').trim(),
            shortDescriptionEn: (item.shortDescriptionEn || '').trim(),
            descriptionEn: (item.descriptionEn || '').trim(),
            featuresEn: (item.featuresEn || '').trim(),
            alternativesEn: (item.alternativesEn || '').trim(),
            notesEn: (item.notesEn || '').trim(),
            // Kategorien verknüpfen
            categories: {
              create: categoryIds.map(categoryId => ({
                category: {
                  connect: {
                    id: categoryId
                  }
                }
              }))
            },
            // Zielgruppen verknüpfen
            targetGroups: {
              create: targetGroupIds.map(targetGroupId => ({
                targetGroup: {
                  connect: {
                    id: targetGroupId
                  }
                }
              }))
            }
          }
        });

        importedSoftware.push(software);
        console.log(`Zeile ${i + 2} erfolgreich importiert: ${software.name}`);
      } catch (error: any) {
        console.error(`Fehler beim Importieren von Zeile ${i + 2}:`, error);
        console.error('Fehler-Details:', error.message, error.code, error.meta);
        errors.push(`Zeile ${i + 2}: ${error.message || 'Unbekannter Fehler'}`);
      }
    }
    
    console.log(`Import abgeschlossen: ${importedSoftware.length} erfolgreich, ${errors.length} Fehler`);

    const responseMessage = errors.length > 0
      ? `${importedSoftware.length} von ${data.length} Software-Einträgen erfolgreich importiert. ${errors.length} Fehler: ${errors.join('; ')}`
      : `${importedSoftware.length} Software-Einträge erfolgreich importiert`;

    return NextResponse.json({
      message: responseMessage,
      count: importedSoftware.length,
      total: data.length,
      errors: errors.length > 0 ? errors : undefined,
      auditLogId: auditLog.id,
    });
  } catch (error) {
    console.error("Fehler beim Import:", error);
    return NextResponse.json(
      { error: "Fehler beim Importieren der Daten: " + (error instanceof Error ? error.message : 'Unbekannter Fehler') },
      { status: 500 }
    );
  }
}

