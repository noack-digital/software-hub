/**
 * Automatische Base-URL-Erkennung für flexible Deployment
 * Funktioniert auf jeder IP/Domain und jedem Port
 */

export function getBaseUrl(): string {
  // Server-side: Verwende Umgebungsvariable falls gesetzt, sonst dynamische Erkennung
  if (typeof window === 'undefined') {
    // Prüfe ob NEXT_PUBLIC_BASE_URL gesetzt ist
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    
    // Fallback für Server-side ohne explizite Base URL
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
  
  // Client-side: Verwende aktuelle Browser-URL
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : '';
    return `${protocol}//${hostname}${portSuffix}`;
  }
  
  return 'http://localhost:3000';
}

export function getApiUrl(path: string = ''): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api${path}`;
}

export function getAbsoluteUrl(path: string = ''): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
}