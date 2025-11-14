'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryStats {
  id: string;
  name: string;
  total: number;
  percentageChange: number;
}

interface TargetGroupStats {
  id: string;
  name: string;
  total: number;
  percentageChange: number;
}

interface SoftwareStats {
  total: number;
  percentageChange: number;
  categories: CategoryStats[];
  targetGroups: TargetGroupStats[];
}

export function SoftwareStats() {
  const [stats, setStats] = useState<SoftwareStats>({ 
    total: 0, 
    percentageChange: 0,
    categories: [],
    targetGroups: []
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

  // Farbpalette für Diagramme
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  // Daten für Kategorien-Diagramm vorbereiten
  const categoryChartData = stats.categories.map(cat => ({
    name: cat.name,
    value: cat.total
  }));

  // Daten für Zielgruppen-Diagramm vorbereiten
  const targetGroupChartData = stats.targetGroups.map(tg => ({
    name: tg.name,
    value: tg.total
  }));

  // Custom Label für Tortendiagramm
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Gesamtstatistik */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Software im Hub</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold">{stats.total}</p>
          <p className="ml-2 text-sm text-gray-500">
            {stats.percentageChange > 0 ? '+' : ''}{stats.percentageChange}% gegenüber letztem Monat
          </p>
        </div>
      </div>

      {/* Kategorien und Zielgruppen Tortendiagramme nebeneinander */}
      {(stats.categories.length > 0 || stats.targetGroups.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kategorien-Tortendiagramm */}
          {stats.categories.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Software nach Kategorien</h4>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} Software`, 'Anzahl']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => {
                      const item = categoryChartData.find(d => d.name === value);
                      return `${value} (${item?.value || 0})`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Detaillierte Liste unter dem Diagramm */}
              <div className="mt-6 border-t pt-4">
                <div className="space-y-2">
                  {stats.categories.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="font-semibold">{category.total}</span>
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
            </div>
          )}

          {/* Zielgruppen-Tortendiagramm */}
          {stats.targetGroups.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Software nach Zielgruppen</h4>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={targetGroupChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {targetGroupChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} Software`, 'Anzahl']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => {
                      const item = targetGroupChartData.find(d => d.name === value);
                      return `${value} (${item?.value || 0})`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Detaillierte Liste unter dem Diagramm */}
              <div className="mt-6 border-t pt-4">
                <div className="space-y-2">
                  {stats.targetGroups.map((targetGroup, index) => (
                    <div key={targetGroup.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900">{targetGroup.name}</span>
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="font-semibold">{targetGroup.total}</span>
                        <span className={`text-xs ${
                          targetGroup.percentageChange > 0 
                            ? 'text-green-600' 
                            : targetGroup.percentageChange < 0 
                            ? 'text-red-600' 
                            : 'text-gray-500'
                        }`}>
                          {targetGroup.percentageChange > 0 ? '+' : ''}{targetGroup.percentageChange}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
