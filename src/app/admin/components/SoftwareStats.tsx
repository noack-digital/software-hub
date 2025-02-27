'use client';

import { useEffect, useState } from 'react';

interface CategoryStats {
  id: string;
  name: string;
  total: number;
  percentageChange: number;
}

interface SoftwareStats {
  total: number;
  percentageChange: number;
  categories: CategoryStats[];
}

export function SoftwareStats() {
  const [stats, setStats] = useState<SoftwareStats>({ 
    total: 0, 
    percentageChange: 0,
    categories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/software');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Software im Hub</h3>
        <div className="mt-2">
          <p className="text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-red-500">Fehler beim Laden der Statistiken</h3>
        <p className="mt-1 text-sm text-gray-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      {/* Gesamtstatistik */}
      <div>
        <h3 className="text-sm font-medium text-gray-500">Software im Hub</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold">{stats.total}</p>
          <p className="ml-2 text-sm text-gray-500">
            {stats.percentageChange > 0 ? '+' : ''}{stats.percentageChange}% gegenüber letztem Monat
          </p>
        </div>
      </div>

      {/* Kategoriestatistiken */}
      {stats.categories.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Nach Kategorien</h4>
          <div className="space-y-3">
            {stats.categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-semibold">{category.total}</span>
                  <span className={`text-xs ${
                    category.percentageChange > 0 
                      ? 'text-green-600' 
                      : category.percentageChange < 0 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                  }`}>
                    {category.percentageChange > 0 ? '+' : ''}{category.percentageChange}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
