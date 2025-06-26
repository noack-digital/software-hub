import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Priorität: 1. Umgebungsvariable, 2. Request-Headers
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!baseUrl) {
      // Base-URL aus den Request-Headers ermitteln
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') ||
                      (host?.includes('localhost') ? 'http' : 'https');
      
      baseUrl = `${protocol}://${host}`;
    }
    
    return NextResponse.json({
      baseUrl,
      success: true,
      source: process.env.NEXT_PUBLIC_BASE_URL ? 'environment' : 'headers'
    });
  } catch (error) {
    console.error('Fehler beim Ermitteln der Base-URL:', error);
    return NextResponse.json(
      { error: 'Fehler beim Ermitteln der Base-URL', success: false },
      { status: 500 }
    );
  }
}