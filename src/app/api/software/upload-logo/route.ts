import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST /api/software/upload-logo - Logo hochladen
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    // Validiere Dateityp
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Ungültiger Dateityp. Erlaubt sind: PNG, JPEG, SVG, ICO' },
        { status: 400 }
      );
    }

    // Validiere Dateigröße (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei zu groß. Maximale Größe: 2MB' },
        { status: 400 }
      );
    }

    // Dateiname generieren
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'png';
    const filename = `uploaded-${timestamp}-${randomString}.${extension}`;

    // Verzeichnis erstellen falls nicht vorhanden
    const logosDir = path.join(process.cwd(), 'public', 'logos');
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    // Datei speichern
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(logosDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Lokale URL zurückgeben
    const logoUrl = `/logos/${filename}`;

    return NextResponse.json({
      success: true,
      logoUrl,
      filename,
    });
  } catch (error) {
    console.error('Fehler beim Hochladen des Logos:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Logos' },
      { status: 500 }
    );
  }
}

