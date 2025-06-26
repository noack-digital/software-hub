'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Package } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string | null;
  } | null;
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      try {
        console.log('Fetching activities from API...');
        const response = await fetch('/api/activities');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        setActivities(data);
      } catch (err) {
        console.error('Detailed client error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Letzte Aktivitäten</h2>
        <div className="text-sm text-gray-600">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Letzte Aktivitäten</h2>
        <div className="text-sm text-red-500">Fehler beim Laden der Aktivitäten: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-4">Letzte Aktivitäten</h2>
      <div className="text-sm text-gray-600">Eine Übersicht der letzten Änderungen im System</div>
      <div className="mt-4 space-y-4">
        {activities.length === 0 ? (
          <div className="text-sm text-gray-500">Keine Aktivitäten vorhanden</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Neue Software hinzugefügt</p>
                <p className="text-sm text-gray-500">
                  {activity.name} wurde {activity.createdBy?.name ? `von ${activity.createdBy.name}` : ''} zur Datenbank hinzugefügt
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), { 
                    addSuffix: true,
                    locale: de 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
