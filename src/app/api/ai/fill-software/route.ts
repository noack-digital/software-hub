import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

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

// POST /api/ai/fill-software - KI-Funktion zum Ausfüllen des Formulars
export async function POST(request: NextRequest) {
  try {
    const { softwareName } = await request.json();

    if (!softwareName || typeof softwareName !== 'string' || softwareName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Software-Name ist erforderlich' },
        { status: 400 }
      );
    }

    // API-Key und AI-Einstellungen aus Settings laden
    const settings = readSettings();
    const apiKeySetting = settings.find((s: any) => s.key === 'geminiApiKey');
    
    if (!apiKeySetting || !apiKeySetting.value || apiKeySetting.value.trim().length === 0) {
      return NextResponse.json(
        { error: 'Gemini API-Key nicht konfiguriert. Bitte konfigurieren Sie den API-Key in den Einstellungen.' },
        { status: 400 }
      );
    }

    const apiKey = apiKeySetting.value.trim();
    
    // AI-Einstellungen lesen (mit Standardwerten)
    const descriptionWords = parseInt(settings.find((s: any) => s.key === 'aiDescriptionWords')?.value || '100');
    const shortDescriptionWords = parseInt(settings.find((s: any) => s.key === 'aiShortDescriptionWords')?.value || '20');
    const alternativesCount = parseInt(settings.find((s: any) => s.key === 'aiAlternativesCount')?.value || '5');
    
    // Debug: API-Key prüfen (nur erste und letzte Zeichen loggen)
    console.log('API-Key Länge:', apiKey.length);
    console.log('API-Key beginnt mit:', apiKey.substring(0, 7));
    console.log('API-Key endet mit:', apiKey.substring(apiKey.length - 4));

    // Gemini API initialisieren
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Liste der verfügbaren Modelle (in Reihenfolge der Priorität)
    // Versuche verschiedene Modelle, falls eines überlastet ist
    const availableModels = [
      'gemini-2.5-flash',      // Neuestes Flash-Modell
      'gemini-2.0-flash',      // Älteres Flash-Modell
      'gemini-2.5-flash-lite', // Lite-Version
      'gemini-2.0-flash-lite'  // Ältere Lite-Version
    ];
    
    let model;
    let lastError: any = null;
    
    // Versuche jedes Modell, bis eines funktioniert
    for (const modelName of availableModels) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Versuche Modell: ${modelName}`);
        break; // Modell gefunden, verwende es
      } catch (error: any) {
        lastError = error;
        console.log(`Modell ${modelName} konnte nicht initialisiert werden:`, error.message?.substring(0, 100));
        continue;
      }
    }
    
    if (!model) {
      throw new Error(`Keines der Modelle konnte initialisiert werden. Letzter Fehler: ${lastError?.message || 'Unbekannter Fehler'}`);
    }

    // Lade vorhandene Kategorien aus der Datenbank
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, nameEn: true }
    });
    
    const categoryNames = categories.map(c => c.name).join(', ');
    const categoryList = categories.map(c => `- ${c.name}`).join('\\n');

    // Prompt erstellen mit strukturierter Ausgabe-Anforderung
    const prompt = `Du bist ein Experte für Software-Beschreibungen. Erstelle eine detaillierte Beschreibung für die Software "${softwareName}".

WICHTIG: Antworte NUR mit einem gültigen JSON-Objekt, keine zusätzlichen Erklärungen oder Markdown-Formatierung.

VERFÜGBARE KATEGORIEN:
${categoryList}

Die JSON-Struktur muss folgende Felder enthalten:

DEUTSCHE FELDER:
- shortDescription: Eine kurze Beschreibung der Software (ca. ${shortDescriptionWords} Wörter, max. 150 Zeichen)
- description: Eine ausführliche Beschreibung der Software (ca. ${descriptionWords} Wörter)
- url: Die offizielle Website-URL der Software (falls bekannt, sonst leerer String "")
- logo: Eine URL zu einem Logo der Software (falls bekannt, sonst leerer String "")
- features: Eine Liste der Hauptfunktionen, jede Funktion in einer neuen Zeile (mit \\n getrennt)
- alternatives: Eine Liste von alternativen Software-Lösungen, jede Alternative in einer neuen Zeile (mit \\n getrennt, max. ${alternativesCount} Alternativen)
- notes: Zusätzliche Anmerkungen oder Hinweise zur Software
- categories: Ein Array von Kategorienamen (nur aus der Liste der verfügbaren Kategorien verwenden, mindestens 1, maximal 3 passende Kategorien). Beispiel: ["Kategorie 1", "Kategorie 2"]

ENGLISCHE FELDER:
- nameEn: Der englische Name der Software
- shortDescriptionEn: Eine kurze englische Beschreibung (ca. ${shortDescriptionWords} Wörter, max. 150 Zeichen)
- descriptionEn: Eine ausführliche englische Beschreibung (ca. ${descriptionWords} Wörter)
- featuresEn: Eine Liste der Hauptfunktionen auf Englisch, jede Funktion in einer neuen Zeile (mit \\n getrennt)
- alternativesEn: Eine Liste von alternativen Software-Lösungen auf Englisch, jede Alternative in einer neuen Zeile (mit \\n getrennt, max. ${alternativesCount} Alternativen)
- notesEn: Zusätzliche Anmerkungen oder Hinweise zur Software auf Englisch

Beispiel-Format (verwende dieses exakte Format):
{
  "shortDescription": "Kurze Beschreibung auf Deutsch...",
  "description": "Beschreibung auf Deutsch...",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "features": "Funktion 1\\nFunktion 2\\nFunktion 3",
  "alternatives": "Alternative 1\\nAlternative 2",
  "notes": "Anmerkungen auf Deutsch...",
  "categories": ["Kategorie 1", "Kategorie 2"],
  "nameEn": "English Name",
  "shortDescriptionEn": "Short description in English...",
  "descriptionEn": "Description in English...",
  "featuresEn": "Feature 1\\nFeature 2\\nFeature 3",
  "alternativesEn": "Alternative 1\\nAlternative 2",
  "notesEn": "Notes in English..."
}`;

    // API-Aufruf mit Fallback für überlastete Modelle
    let result;
    let response;
    let text;
    let lastApiError: any = null;
    
    // Versuche jedes Modell, bis eines erfolgreich ist
    for (const modelName of availableModels) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Versuche API-Aufruf mit Modell: ${modelName}`);
        result = await model.generateContent(prompt);
        response = await result.response;
        text = response.text();
        console.log(`Erfolgreich mit Modell ${modelName}, Antwort-Länge:`, text.length);
        break; // Erfolgreich, beende Schleife
      } catch (error: any) {
        lastApiError = error;
        const errorMsg = error.message || String(error);
        
        // Wenn das Modell überlastet ist (503), versuche das nächste
        if (errorMsg.includes('503') || errorMsg.includes('overloaded') || errorMsg.includes('Service Unavailable')) {
          console.log(`Modell ${modelName} ist überlastet, versuche nächstes Modell...`);
          continue;
        }
        
        // Wenn das Modell nicht gefunden wurde (404), versuche das nächste
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          console.log(`Modell ${modelName} nicht gefunden, versuche nächstes Modell...`);
          continue;
        }
        
        // Wenn das Quota überschritten ist (429), versuche das nächste Modell
        // Verschiedene Modelle haben möglicherweise unterschiedliche Quotas
        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Quota exceeded') || errorMsg.includes('Resource exhausted')) {
          console.log(`Modell ${modelName} Quota überschritten, versuche nächstes Modell...`);
          continue;
        }
        
        // Bei anderen Fehlern (z.B. ungültiger API-Key), werfe den Fehler weiter
        console.log(`Modell ${modelName} Fehler:`, errorMsg.substring(0, 200));
        throw error;
      }
    }
    
    // Wenn alle Modelle fehlgeschlagen sind
    if (!text) {
      if (lastApiError) {
        const errorMsg = lastApiError.message || String(lastApiError);
        // Prüfe, ob es ein Quota-Problem ist
        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Quota exceeded') || errorMsg.includes('Resource exhausted')) {
          throw new Error('API-Quota überschritten. Der kostenlose Plan hat Limits. Bitte warten Sie einige Minuten und versuchen Sie es erneut. Alternativ können Sie einen kostenpflichtigen Plan verwenden.');
        }
        throw lastApiError;
      }
      throw new Error('Alle Modelle sind überlastet oder nicht verfügbar. Bitte versuchen Sie es später erneut.');
    }

    // JSON aus der Antwort extrahieren
    let jsonData;
    try {
      // Entferne mögliche Markdown-Code-Blöcke
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }
      
      // Versuche JSON zu extrahieren
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        console.error('Kein JSON gefunden in Antwort:', text);
        throw new Error('Kein JSON gefunden in der KI-Antwort');
      }
    } catch (parseError) {
      console.error('Fehler beim Parsen der KI-Antwort:', parseError);
      console.error('KI-Antwort (erste 500 Zeichen):', text.substring(0, 500));
      return NextResponse.json(
        { error: 'Fehler beim Verarbeiten der KI-Antwort. Bitte versuchen Sie es erneut.' },
        { status: 500 }
      );
    }

    // Validierung und Bereinigung der Daten
    // Kategorien validieren und IDs zuordnen
    let categoryIds: string[] = [];
    if (jsonData.categories && Array.isArray(jsonData.categories)) {
      // Finde passende Kategorien-IDs basierend auf den Namen
      const categoryNameMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
      categoryIds = jsonData.categories
        .map((catName: string) => {
          if (typeof catName === 'string') {
            return categoryNameMap.get(catName.toLowerCase());
          }
          return null;
        })
        .filter((id: string | null | undefined): id is string => id !== null && id !== undefined);
    }

    const cleanedData = {
      shortDescription: jsonData.shortDescription || '',
      description: jsonData.description || '',
      url: jsonData.url || '',
      logo: jsonData.logo || '',
      features: jsonData.features || '',
      alternatives: jsonData.alternatives || '',
      notes: jsonData.notes || '',
      nameEn: jsonData.nameEn || '',
      shortDescriptionEn: jsonData.shortDescriptionEn || '',
      descriptionEn: jsonData.descriptionEn || '',
      featuresEn: jsonData.featuresEn || '',
      alternativesEn: jsonData.alternativesEn || '',
      notesEn: jsonData.notesEn || '',
      categories: categoryIds, // Array von Kategorien-IDs
    };

    return NextResponse.json(cleanedData);
  } catch (error: any) {
    console.error('Fehler bei KI-Anfrage:', error);
    console.error('Fehler-Details:', JSON.stringify(error, null, 2));
    
    // Spezifische Fehlermeldungen
    const errorMessage = error.message || error.toString() || '';
    
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('401') || errorMessage.includes('API key not valid')) {
      return NextResponse.json(
        { error: 'Ungültiger API-Key. Bitte überprüfen Sie Ihre Gemini API-Key-Einstellungen.' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('QUOTA') || errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Quota exceeded') || errorMessage.includes('Resource exhausted')) {
      return NextResponse.json(
        { error: 'API-Quota überschritten. Der kostenlose Google Gemini Plan hat Limits (z.B. Anfragen pro Minute). Bitte warten Sie einige Minuten und versuchen Sie es erneut. Sie können Ihre Nutzung unter https://ai.google.dev/usage überprüfen.' },
        { status: 429 }
      );
    }

    if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('Service Unavailable')) {
      return NextResponse.json(
        { error: 'Die KI-Modelle sind derzeit überlastet. Bitte versuchen Sie es in ein paar Sekunden erneut.' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('MODEL_NOT_FOUND') || errorMessage.includes('404')) {
      return NextResponse.json(
        { error: 'Das angeforderte Modell ist nicht verfügbar. Bitte versuchen Sie es später erneut.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: `Fehler bei der KI-Anfrage: ${errorMessage.substring(0, 200)}` },
      { status: 500 }
    );
  }
}

