import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

// GET /api/ai/test-key - Teste ob API-Key funktioniert
export async function GET(request: NextRequest) {
  try {
    const settings = readSettings();
    const apiKeySetting = settings.find((s: any) => s.key === 'geminiApiKey');
    
    if (!apiKeySetting || !apiKeySetting.value || apiKeySetting.value.trim().length === 0) {
      return NextResponse.json({
        valid: false,
        hasKey: false,
        message: 'Kein API-Key konfiguriert'
      });
    }

    const apiKey = apiKeySetting.value.trim();
    
    // Versuche eine einfache API-Anfrage zu stellen
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Verwende ein stabiles Modell statt experimentelles, um Quota-Probleme zu vermeiden
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Sehr einfache Test-Anfrage
      const result = await model.generateContent('Say "OK"');
      const response = await result.response;
      const text = response.text();
      
      return NextResponse.json({
        valid: true,
        hasKey: true,
        message: 'API-Key ist gültig und funktioniert',
        testResponse: text.substring(0, 50)
      });
    } catch (error: any) {
      const errorMessage = error.message || error.toString() || '';
      
      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('401') || errorMessage.includes('API key not valid')) {
        return NextResponse.json({
          valid: false,
          hasKey: true,
          message: 'API-Key ist ungültig'
        });
      }
      
      if (errorMessage.includes('QUOTA') || errorMessage.includes('429') || errorMessage.includes('quota')) {
        // Quota-Fehler bedeutet, dass der Key grundsätzlich funktioniert, aber das Limit erreicht wurde
        return NextResponse.json({
          valid: true,
          hasKey: true,
          message: 'API-Key ist gültig (Quota-Limit erreicht)',
          warning: 'Quota-Limit erreicht'
        });
      }
      
      // Andere Fehler
      return NextResponse.json({
        valid: false,
        hasKey: true,
        message: `API-Key-Test fehlgeschlagen: ${errorMessage.substring(0, 100)}`
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      valid: false,
      hasKey: false,
      message: `Fehler beim Testen: ${error.message || String(error)}`
    }, { status: 500 });
  }
}

