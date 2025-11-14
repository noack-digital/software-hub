import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Hilfsfunktion zum Extrahieren der Domain aus einer URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

// Hilfsfunktion zum Normalisieren des Domainnamens für Dateinamen
function normalizeDomain(domain: string): string {
  return domain.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

// Versuche Favicon von verschiedenen Quellen herunterzuladen
async function fetchFavicon(websiteUrl: string): Promise<{ buffer: Buffer; extension: string } | null> {
  try {
    const urlObj = new URL(websiteUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    const domain = urlObj.hostname.replace('www.', '');

    // Strategie 1: Versuche /favicon.ico direkt
    try {
      const faviconUrl = `${baseUrl}/favicon.ico`;
      const response = await fetch(faviconUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || '';
        let extension = 'ico';
        if (contentType.includes('png')) extension = 'png';
        else if (contentType.includes('svg')) extension = 'svg';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';

        return { buffer, extension };
      }
    } catch (error) {
      console.log('Favicon.ico nicht gefunden, versuche nächste Methode...');
    }

    // Strategie 2: Parse HTML nach <link rel="icon"> Tags
    try {
      const htmlResponse = await fetch(baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (htmlResponse.ok) {
        const html = await htmlResponse.text();
        
        // Suche nach <link rel="icon"> oder <link rel="shortcut icon">
        const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
        if (iconMatch) {
          let iconUrl = iconMatch[1];
          
          // Relative URLs zu absoluten URLs konvertieren
          if (iconUrl.startsWith('//')) {
            iconUrl = `${urlObj.protocol}${iconUrl}`;
          } else if (iconUrl.startsWith('/')) {
            iconUrl = `${baseUrl}${iconUrl}`;
          } else if (!iconUrl.startsWith('http')) {
            iconUrl = `${baseUrl}/${iconUrl}`;
          }

          const iconResponse = await fetch(iconUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          if (iconResponse.ok) {
            const buffer = Buffer.from(await iconResponse.arrayBuffer());
            const contentType = iconResponse.headers.get('content-type') || '';
            let extension = 'ico';
            if (contentType.includes('png')) extension = 'png';
            else if (contentType.includes('svg')) extension = 'svg';
            else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';

            return { buffer, extension };
          }
        }
      }
    } catch (error) {
      console.log('HTML-Parsing fehlgeschlagen, versuche Fallback...');
    }

    // Strategie 3: Google Favicon Service als Fallback
    try {
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      const response = await fetch(googleFaviconUrl);

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        return { buffer, extension: 'png' };
      }
    } catch (error) {
      console.log('Google Favicon Service fehlgeschlagen');
    }

    return null;
  } catch (error) {
    console.error('Fehler beim Herunterladen des Favicons:', error);
    return null;
  }
}

// POST /api/software/fetch-favicon - Favicon von Website herunterladen
export async function POST(request: NextRequest) {
  try {
    const { websiteUrl } = await request.json();

    if (!websiteUrl || typeof websiteUrl !== 'string') {
      return NextResponse.json(
        { error: 'Website-URL ist erforderlich' },
        { status: 400 }
      );
    }

    // Validiere URL
    let url: URL;
    try {
      url = new URL(websiteUrl);
    } catch {
      return NextResponse.json(
        { error: 'Ungültige URL' },
        { status: 400 }
      );
    }

    // Favicon herunterladen
    const faviconData = await fetchFavicon(websiteUrl);

    if (!faviconData) {
      return NextResponse.json(
        { error: 'Favicon konnte nicht gefunden werden' },
        { status: 404 }
      );
    }

    // Domain für Dateinamen extrahieren
    const domain = extractDomain(websiteUrl);
    const normalizedDomain = normalizeDomain(domain);
    
    // Eindeutigen Dateinamen generieren
    const timestamp = Date.now();
    const hash = Buffer.from(websiteUrl).toString('base64').substring(0, 8).replace(/[^a-z0-9]/gi, '');
    const filename = `${normalizedDomain}-${hash}.${faviconData.extension}`;
    
    // Verzeichnis erstellen falls nicht vorhanden
    const logosDir = path.join(process.cwd(), 'public', 'logos');
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    // Datei speichern
    const filePath = path.join(logosDir, filename);
    fs.writeFileSync(filePath, faviconData.buffer);

    // Lokale URL zurückgeben
    const logoUrl = `/logos/${filename}`;

    return NextResponse.json({
      success: true,
      logoUrl,
      filename,
    });
  } catch (error) {
    console.error('Fehler beim Herunterladen des Favicons:', error);
    return NextResponse.json(
      { error: 'Fehler beim Herunterladen des Favicons' },
      { status: 500 }
    );
  }
}

