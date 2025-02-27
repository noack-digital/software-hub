'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('software');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Statistiken');
      }
      return response.json();
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-8">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('software')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'software'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Software
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Benutzer
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'audit'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Audit-Log
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Software-Einträge</h3>
          <p className="text-3xl font-bold">
            {isLoading ? '...' : stats?.softwareCount}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Benutzer</h3>
          <p className="text-3xl font-bold">
            {isLoading ? '...' : stats?.userCount}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Downloads (Gesamt)</h3>
          <p className="text-3xl font-bold">
            {isLoading ? '...' : stats?.totalDownloads}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {activeTab === 'software' && 'Software Verwaltung'}
              {activeTab === 'users' && 'Benutzer Verwaltung'}
              {activeTab === 'audit' && 'Audit-Log'}
            </h2>
            {activeTab === 'software' && (
              <div className="space-x-4">
                <Link
                  href="/admin/software/new"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Neue Software
                </Link>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                  Exportieren
                </button>
                <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                  Importieren
                </button>
              </div>
            )}
          </div>
          
          {/* Hier kommen die jeweiligen Listen-Komponenten */}
          {activeTab === 'software' && <div>Software Liste kommt hier</div>}
          {activeTab === 'users' && <div>Benutzer Liste kommt hier</div>}
          {activeTab === 'audit' && <div>Audit-Log Liste kommt hier</div>}
        </div>
      </div>
    </div>
  );
}
