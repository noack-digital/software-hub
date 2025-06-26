import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/settings - Alle Einstellungen abrufen
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/settings - Anfrage erhalten');
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    console.log('Abgefragter Schlüssel:', key);

    if (key) {
      // Einzelne Einstellung abrufen
      console.log('Suche nach Einstellung mit Schlüssel:', key);
      const setting = await prisma.settings.findUnique({
        where: { key }
      });
      console.log('Gefundene Einstellung:', setting);

      if (!setting) {
        console.log('Einstellung nicht gefunden');
        return NextResponse.json(
          { error: 'Einstellung nicht gefunden' },
          { status: 404 }
        );
      }

      return NextResponse.json(setting);
    } else {
      // Alle Einstellungen abrufen
      console.log('Rufe alle Einstellungen ab');
      const settings = await prisma.settings.findMany();
      console.log('Anzahl gefundener Einstellungen:', settings.length);
      console.log('Erste Einstellung (falls vorhanden):', settings.length > 0 ? settings[0] : 'Keine Einstellungen gefunden');

      return NextResponse.json(settings);
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Einstellungen:', error);
    return NextResponse.json(
      { error: `Fehler beim Abrufen der Einstellungen: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Einstellung aktualisieren
export async function PATCH(request: NextRequest) {
  try {
    console.log('PATCH /api/settings - Anfrage erhalten');
    const body = await request.json();
    console.log('Anfragekörper:', body);

    // Validierung
    if (!body.key || body.value === undefined) {
      console.log('Validierungsfehler: Schlüssel oder Wert fehlt');
      return NextResponse.json(
        { error: 'Schlüssel und Wert sind erforderlich' },
        { status: 400 }
      );
    }

    // Prüfen, ob Einstellung existiert
    console.log('Prüfe, ob Einstellung existiert:', body.key);
    const existingSetting = await prisma.settings.findUnique({
      where: { key: body.key }
    });
    
    if (!existingSetting) {
      console.log('Einstellung nicht gefunden');
      return NextResponse.json(
        { error: 'Einstellung nicht gefunden' },
        { status: 404 }
      );
    }

    // Einstellung aktualisieren
    console.log('Aktualisiere Einstellung');
    const updatedSetting = await prisma.settings.update({
      where: { key: body.key },
      data: {
        value: body.value,
        description: body.description || existingSetting.description,
        updatedAt: new Date()
      }
    });

    console.log('Aktualisierte Einstellung:', updatedSetting);
    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Einstellung:', error);
    return NextResponse.json(
      { error: `Fehler beim Aktualisieren der Einstellung: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
