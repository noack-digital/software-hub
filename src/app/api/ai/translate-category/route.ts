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

// POST /api/ai/translate-category - Übersetze Kategorie mit KI
export async function POST(request: NextRequest) {
  let text = '';
  let fromLanguage = '';
  let toLanguage = '';
  
  try {
    const body = await request.json();
    text = body.text;
    fromLanguage = body.fromLanguage;
    toLanguage = body.toLanguage;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text ist erforderlich' },
        { status: 400 }
      );
    }

    if (!fromLanguage || !toLanguage) {
      return NextResponse.json(
        { error: 'Sprachen sind erforderlich' },
        { status: 400 }
      );
    }

    // API-Key aus Settings laden
    const settings = readSettings();
    const apiKeySetting = settings.find((s: any) => s.key === 'geminiApiKey');
    
    if (!apiKeySetting || !apiKeySetting.value || apiKeySetting.value.trim().length === 0) {
      return NextResponse.json(
        { error: 'Gemini API-Key nicht konfiguriert. Bitte konfigurieren Sie den API-Key in den Einstellungen.' },
        { status: 400 }
      );
    }

    const apiKey = apiKeySetting.value.trim();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Verfügbare Modelle (in Reihenfolge der Priorität)
    // Verwende die gleichen Modelle wie beim Software-Befüllen, um Quota-Probleme zu vermeiden
    const availableModels = [
      'gemini-2.5-flash',      // Neuestes Flash-Modell (hat Free-Tier-Unterstützung)
      'gemini-2.0-flash',      // Älteres Flash-Modell
      'gemini-2.5-flash-lite', // Lite-Version (weniger Quota-Verbrauch)
      'gemini-2.0-flash-lite', // Ältere Lite-Version
      'gemini-1.5-flash',      // Fallback-Modell
    ];
    
    let model;
    let lastError: any = null;
    
    // Versuche verschiedene Modelle
    for (const modelName of availableModels) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        break;
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    if (!model) {
      return NextResponse.json(
        { error: 'Kein verfügbares Modell gefunden' },
        { status: 500 }
      );
    }

    // Prompt für Übersetzung
    const prompt = `Übersetze den folgenden Text von ${fromLanguage} nach ${toLanguage}. 
Gib nur die Übersetzung zurück, ohne zusätzliche Erklärungen oder Formatierungen.

Text: "${text}"

Übersetzung:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text().trim();

      return NextResponse.json({
        translatedText,
        originalText: text,
        fromLanguage,
        toLanguage,
      });
    } catch (apiError: any) {
      // Detailliertes Logging für API-Fehler
      console.error('API-Fehler Details:', {
        message: apiError.message,
        status: apiError.status,
        statusText: apiError.statusText,
        code: apiError.code,
        error: JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)),
      });

      const errorMessage = apiError.message || apiError.toString() || '';
      const errorCode = apiError.code || '';
      const errorStatus = apiError.status || '';
      
      // Prüfe auf API-Key-Fehler
      if (
        errorMessage.includes('API_KEY_INVALID') || 
        errorMessage.includes('401') || 
        errorMessage.includes('API key not valid') ||
        errorCode === 'API_KEY_INVALID' ||
        errorStatus === 401
      ) {
        return NextResponse.json(
          { error: 'Ungültiger API-Key. Bitte überprüfen Sie Ihre Gemini API-Key-Einstellungen.' },
          { status: 401 }
        );
      }

      // Prüfe auf Quota-Fehler (nur wenn wirklich ein Quota-Fehler vorliegt)
      const isQuotaError = (
        errorMessage.includes('QUOTA') || 
        errorMessage.includes('429') || 
        errorMessage.includes('quota') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('Rate limit') ||
        errorCode === 'RESOURCE_EXHAUSTED' ||
        errorStatus === 429 ||
        (errorStatus >= 429 && errorStatus < 500)
      );

      if (isQuotaError) {
        // Versuche Retry-Delay aus der Fehlermeldung zu extrahieren
        let retryDelaySeconds = null;
        const retryMatch = errorMessage.match(/Please retry in ([\d.]+)s/i);
        if (retryMatch) {
          retryDelaySeconds = Math.ceil(parseFloat(retryMatch[1]));
        }
        
        // Prüfe ob es Free-Tier Limits sind
        const isFreeTierLimit = errorMessage.includes('free_tier') || errorMessage.includes('FreeTier');
        
        let userMessage = 'API-Quota überschritten.';
        if (isFreeTierLimit) {
          userMessage += ' Der kostenlose Plan hat Limits erreicht.';
        }
        if (retryDelaySeconds) {
          userMessage += ` Bitte versuchen Sie es in ${retryDelaySeconds} Sekunden erneut.`;
        } else {
          userMessage += ' Bitte warten Sie einige Minuten und versuchen Sie es erneut.';
        }
        
        return NextResponse.json(
          { 
            error: userMessage,
            details: isFreeTierLimit 
              ? 'Der kostenlose Gemini API-Plan hat Limits. Sie können entweder warten oder auf einen kostenpflichtigen Plan upgraden.'
              : 'Das API-Limit wurde erreicht. Bitte versuchen Sie es später erneut oder überprüfen Sie Ihr API-Kontingent.',
            retryDelaySeconds,
            isFreeTierLimit,
            debug: process.env.NODE_ENV === 'development' ? { errorMessage, errorCode, errorStatus } : undefined
          },
          { status: 429 }
        );
      }

      // Wenn es kein Quota-Fehler ist, zeige den tatsächlichen Fehler
      throw apiError;
    }
  } catch (error: any) {
    console.error('Fehler bei KI-Übersetzung:', error);
    
    const errorMessage = error.message || error.toString() || '';
    const errorCode = error.code || '';
    const errorStatus = error.status || '';
    
    // Prüfe auf API-Key-Fehler
    if (
      errorMessage.includes('API_KEY_INVALID') || 
      errorMessage.includes('401') || 
      errorMessage.includes('API key not valid') ||
      errorCode === 'API_KEY_INVALID' ||
      errorStatus === 401
    ) {
      return NextResponse.json(
        { error: 'Ungültiger API-Key. Bitte überprüfen Sie Ihre Gemini API-Key-Einstellungen.' },
        { status: 401 }
      );
    }

    // Prüfe auf Quota-Fehler im äußeren Catch-Block
    const isQuotaErrorOuter = (
      errorMessage.includes('QUOTA') || 
      errorMessage.includes('429') || 
      errorMessage.includes('quota') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('Rate limit') ||
      errorCode === 'RESOURCE_EXHAUSTED' ||
      errorStatus === 429 ||
      (typeof errorStatus === 'number' && errorStatus >= 429 && errorStatus < 500)
    );

    if (isQuotaErrorOuter) {
      // Versuche Retry-Delay aus der Fehlermeldung zu extrahieren
      let retryDelaySeconds = null;
      const retryMatch = errorMessage.match(/Please retry in ([\d.]+)s/i);
      if (retryMatch) {
        retryDelaySeconds = Math.ceil(parseFloat(retryMatch[1]));
      }
      
      // Prüfe ob es Free-Tier Limits sind
      const isFreeTierLimit = errorMessage.includes('free_tier') || errorMessage.includes('FreeTier');
      
      let userMessage = 'API-Quota überschritten.';
      if (isFreeTierLimit) {
        userMessage += ' Der kostenlose Plan hat Limits erreicht.';
      }
      if (retryDelaySeconds) {
        userMessage += ` Bitte versuchen Sie es in ${retryDelaySeconds} Sekunden erneut.`;
      } else {
        userMessage += ' Bitte warten Sie einige Minuten und versuchen Sie es erneut.';
      }
      
      return NextResponse.json(
        { 
          error: userMessage,
          details: isFreeTierLimit 
            ? 'Der kostenlose Gemini API-Plan hat Limits. Sie können entweder warten oder auf einen kostenpflichtigen Plan upgraden.'
            : 'Das API-Limit wurde erreicht. Bitte versuchen Sie es später erneut oder überprüfen Sie Ihr API-Kontingent.',
          retryDelaySeconds,
          isFreeTierLimit,
          debug: process.env.NODE_ENV === 'development' ? { errorMessage, errorCode, errorStatus } : undefined
        },
        { status: 429 }
      );
    }

    // Prüfe auf Modell-Fehler
    if (errorMessage.includes('MODEL_NOT_FOUND') || errorMessage.includes('model not found') || errorCode === 'MODEL_NOT_FOUND') {
      // Versuche ein anderes Modell - verwende die bereits geparsten Variablen
      try {
        const fallbackText = text;
        const fallbackFromLang = fromLanguage;
        const fallbackToLang = toLanguage;
        
        const settings = readSettings();
        const apiKeySetting = settings.find((s: any) => s.key === 'geminiApiKey');
        const apiKey = apiKeySetting?.value?.trim();
        const genAI = new GoogleGenerativeAI(apiKey);
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const fallbackPrompt = `Übersetze den folgenden Text von ${fallbackFromLang} nach ${fallbackToLang}. 
Gib nur die Übersetzung zurück, ohne zusätzliche Erklärungen oder Formatierungen.

Text: "${fallbackText}"

Übersetzung:`;
        
        const result = await fallbackModel.generateContent(fallbackPrompt);
        const response = await result.response;
        const translatedText = response.text().trim();
        
        return NextResponse.json({
          translatedText,
          originalText: fallbackText,
          fromLanguage: fallbackFromLang,
          toLanguage: fallbackToLang,
        });
      } catch (fallbackError: any) {
        console.error('Fallback-Modell Fehler:', fallbackError);
        return NextResponse.json(
          { error: 'Modell nicht verfügbar. Bitte versuchen Sie es später erneut.' },
          { status: 503 }
        );
      }
    }

    // Zeige den tatsächlichen Fehler mit vollständigen Details
    console.error('Vollständiger Fehler:', {
      errorMessage,
      errorCode,
      errorStatus,
      error: error.toString(),
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: `Fehler bei der Übersetzung: ${errorMessage.substring(0, 300)}`,
        details: errorMessage.length > 300 ? errorMessage.substring(300, 600) : undefined,
        debug: process.env.NODE_ENV === 'development' ? { 
          errorMessage, 
          errorCode, 
          errorStatus,
          fullError: error.toString(),
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}

