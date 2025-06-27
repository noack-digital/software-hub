import { getApiUrl } from '@/lib/base-url';

export function useApi() {
  const apiCall = async (endpoint: string, options?: RequestInit) => {
    // Für relative URLs (die mit /api/ beginnen) verwenden wir sie direkt
    // da sie automatisch mit der aktuellen Domain funktionieren
    if (endpoint.startsWith('/api/')) {
      return fetch(endpoint, options);
    }
    
    // Für absolute URLs verwenden wir getApiUrl
    const url = getApiUrl(endpoint);
    return fetch(url, options);
  };

  return { apiCall };
}