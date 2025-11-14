import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/base-url';

export async function GET(request: NextRequest) {
  try {
    // Versuche Base-URL aus Request-Headers zu ermitteln
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 
                    (host?.includes('localhost') ? 'http' : 'https');
    
    let baseUrl = '';
    
    if (host) {
      baseUrl = `${protocol}://${host}`;
    } else {
      // Fallback auf getBaseUrl()
      baseUrl = getBaseUrl();
    }

    return NextResponse.json({
      success: true,
      baseUrl,
      host,
      protocol,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fehler beim Ermitteln der Base-URL:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Ermitteln der Base-URL',
      baseUrl: getBaseUrl() // Fallback
    }, { status: 500 });
  }
}