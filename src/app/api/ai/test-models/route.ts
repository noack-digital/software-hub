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

// GET /api/ai/test-models - Teste verfügbare Modelle
export async function GET(request: NextRequest) {
  try {
    // API-Key aus Settings laden
    const settings = readSettings();
    const apiKeySetting = settings.find((s: any) => s.key === 'geminiApiKey');
    
    if (!apiKeySetting || !apiKeySetting.value || apiKeySetting.value.trim().length === 0) {
      return NextResponse.json(
        { error: 'Gemini API-Key nicht konfiguriert' },
        { status: 400 }
      );
    }

    const apiKey = apiKeySetting.value.trim();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Versuche zuerst, verfügbare Modelle aufzulisten
    let availableModels: any[] = [];
    try {
      const models = await genAI.listModels();
      availableModels = models.map((m: any) => ({
        name: m.name,
        displayName: m.displayName,
        supportedGenerationMethods: m.supportedGenerationMethods
      }));
    } catch (listError: any) {
      console.error('Fehler beim Auflisten der Modelle:', listError);
    }
    
    // Versuche auch direkt über REST API (v1 statt v1beta)
    let restApiModels: any = null;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      if (response.ok) {
        const data = await response.json();
        restApiModels = data.models?.map((m: any) => ({
          name: m.name,
          displayName: m.displayName
        })) || [];
      }
    } catch (restError: any) {
      console.error('Fehler bei REST API:', restError);
    }
    
    // Teste verschiedene Modellnamen
    const testModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash'
    ];
    
    const results: any[] = [];
    
    for (const modelName of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "test"');
        const response = await result.response;
        const text = response.text();
        results.push({
          model: modelName,
          status: 'success',
          response: text.substring(0, 50)
        });
        break; // Erste erfolgreiche Antwort reicht
      } catch (error: any) {
        results.push({
          model: modelName,
          status: 'error',
          error: error.message?.substring(0, 200) || String(error)
        });
      }
    }
    
    return NextResponse.json({
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 7),
      availableModelsSDK: availableModels.length > 0 ? availableModels : 'Konnte Modelle nicht auflisten (SDK)',
      availableModelsREST: restApiModels || 'Konnte Modelle nicht auflisten (REST API)',
      testResults: results
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}

