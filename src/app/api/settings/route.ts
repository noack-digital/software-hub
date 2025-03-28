import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Pfad zur JSON-Datei
const settingsFilePath = path.join(process.cwd(), 'src', 'data', 'settings.json');

// Hilfsfunktion zum Lesen der Einstellungen
const readSettings = () => {
  try {
    const fileContent = fs.readFileSync(settingsFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Fehler beim Lesen der Einstellungen:', error);
    return [];
  }
};

// Hilfsfunktion zum Schreiben der Einstellungen
const writeSettings = (settings: any[]) => {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Fehler beim Schreiben der Einstellungen:', error);
    return false;
  }
};

// GET /api/settings - Alle Einstellungen abrufen
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/settings - Anfrage erhalten');
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    console.log('Abgefragter Schlüssel:', key);

    const settings = readSettings();
    
    if (key) {
      // Einzelne Einstellung abrufen
      console.log('Suche nach Einstellung mit Schlüssel:', key);
      const setting = settings.find((s: any) => s.key === key);
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
    if (!body.key || !body.value) {
      console.log('Validierungsfehler: Schlüssel oder Wert fehlt');
      return NextResponse.json(
        { error: 'Schlüssel und Wert sind erforderlich' },
        { status: 400 }
      );
    }

    // Alle Einstellungen lesen
    const settings = readSettings();

    // Prüfen, ob Einstellung existiert
    console.log('Prüfe, ob Einstellung existiert:', body.key);
    const settingIndex = settings.findIndex((s: any) => s.key === body.key);
    
    if (settingIndex === -1) {
      console.log('Einstellung nicht gefunden');
      return NextResponse.json(
        { error: 'Einstellung nicht gefunden' },
        { status: 404 }
      );
    }

    // Einstellung aktualisieren
    console.log('Aktualisiere Einstellung');
    settings[settingIndex].value = body.value;
    if (body.description) {
      settings[settingIndex].description = body.description;
    }
    settings[settingIndex].updatedAt = new Date().toISOString();

    // Einstellungen zurückschreiben
    const success = writeSettings(settings);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Einstellungen' },
        { status: 500 }
      );
    }

    console.log('Aktualisierte Einstellung:', settings[settingIndex]);
    return NextResponse.json(settings[settingIndex]);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Einstellung:', error);
    return NextResponse.json(
      { error: `Fehler beim Aktualisieren der Einstellung: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// POST /api/settings - Neue Einstellung erstellen
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/settings - Anfrage erhalten');
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

    // Alle Einstellungen lesen
    const settings = readSettings();

    // Prüfen, ob Einstellung bereits existiert
    console.log('Prüfe, ob Einstellung bereits existiert:', body.key);
    const existingSetting = settings.find((s: any) => s.key === body.key);
    
    if (existingSetting) {
      console.log('Einstellung existiert bereits');
      return NextResponse.json(
        { error: 'Eine Einstellung mit diesem Schlüssel existiert bereits' },
        { status: 409 }
      );
    }

    // Neue Einstellung erstellen
    console.log('Erstelle neue Einstellung');
    const now = new Date().toISOString();
    const newSetting = {
      id: `setting_${Date.now()}`,
      key: body.key,
      value: body.value,
      description: body.description || null,
      createdAt: now,
      updatedAt: now
    };

    // Einstellung hinzufügen
    settings.push(newSetting);

    // Einstellungen zurückschreiben
    const success = writeSettings(settings);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Einstellungen' },
        { status: 500 }
      );
    }

    console.log('Neue Einstellung erstellt:', newSetting);
    return NextResponse.json(newSetting, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen der Einstellung:', error);
    return NextResponse.json(
      { error: `Fehler beim Erstellen der Einstellung: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
