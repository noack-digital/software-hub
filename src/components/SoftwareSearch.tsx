'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Software } from '@prisma/client';

type Category = {
  id: string;
  name: string;
  count: number;
};

const categories: Category[] = [
  { id: 'alle', name: 'Alle', count: 15 },
  { id: 'office', name: 'Office & Zusammenarbeit', count: 7 },
  { id: 'projektmanagement', name: 'Projektmanagement', count: 3 },
  { id: 'statistik', name: 'Statistik & Medien', count: 3 },
  { id: 'entwicklung', name: 'Entwicklung', count: 2 },
  { id: 'gis', name: 'GIS', count: 2 },
  { id: 'service', name: 'Service', count: 2 },
  { id: 'lernen', name: 'Lernen', count: 1 },
  { id: 'sicherheit', name: 'Sicherheit', count: 1 },
];

export function SoftwareSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('alle');
  const [filter, setFilter] = useState({
    type: 'all',
    cost: 'all',
    verified: false,
  });

  const { data: software = [], isLoading } = useQuery<Software[]>({
    queryKey: ['software', searchQuery, selectedCategory, filter],
    queryFn: async () => {
      const response = await fetch(`/api/software?q=${searchQuery}&category=${selectedCategory}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: '#004d3d' }} />
        <input
          type="text"
          placeholder="Software suchen..."
          className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium ${
              selectedCategory === category.id
                ? 'text-white'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: selectedCategory === category.id ? '#004d3d' : 'transparent',
            }}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Typ</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-gray-900">
              <input
                type="radio"
                name="type"
                checked={filter.type === 'all'}
                onChange={() => setFilter({ ...filter, type: 'all' })}
                className="text-[#004d3d] focus:ring-[#004d3d]"
              />
              Alle
            </label>
            <label className="flex items-center gap-2 text-gray-900">
              <input
                type="radio"
                name="type"
                checked={filter.type === 'desktop'}
                onChange={() => setFilter({ ...filter, type: 'desktop' })}
                className="text-[#004d3d] focus:ring-[#004d3d]"
              />
              Desktop
            </label>
            <label className="flex items-center gap-2 text-gray-900">
              <input
                type="radio"
                name="type"
                checked={filter.type === 'web'}
                onChange={() => setFilter({ ...filter, type: 'web' })}
                className="text-[#004d3d] focus:ring-[#004d3d]"
              />
              Web
            </label>
            <label className="flex items-center gap-2 text-gray-900">
              <input
                type="radio"
                name="type"
                checked={filter.type === 'mobile'}
                onChange={() => setFilter({ ...filter, type: 'mobile' })}
                className="text-[#004d3d] focus:ring-[#004d3d]"
              />
              Mobile
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Kosten</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-gray-900">
              <input
                type="radio"
                name="cost"
                checked={filter.cost === 'all'}
                onChange={() => setFilter({ ...filter, cost: 'all' })}
                className="text-[#004d3d] focus:ring-[#004d3d]"
              />
              Alle
            </label>
            <label className="flex items-center gap-2 text-gray-900">
              <input
                type="radio"
                name="cost"
                checked={filter.cost === 'free'}
                onChange={() => setFilter({ ...filter, cost: 'free' })}
                className="text-[#004d3d] focus:ring-[#004d3d]"
              />
              Kostenlos
            </label>
            <label className="flex items-center gap-2 text-gray-900">
              <input
                type="radio"
                name="cost"
                checked={filter.cost === 'paid'}
                onChange={() => setFilter({ ...filter, cost: 'paid' })}
                className="text-[#004d3d] focus:ring-[#004d3d]"
              />
              Kostenpflichtig
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Verfügbarkeit</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-gray-900">
              <input
                type="checkbox"
                checked={filter.verified}
                onChange={(e) =>
                  setFilter({ ...filter, verified: e.target.checked })
                }
                className="rounded border-gray-300 text-[#004d3d] focus:ring-[#004d3d]"
              />
              Nur HNEE-verfügbare Software
            </label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-600">Lädt...</div>
      ) : (
        <div className="mt-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Typ</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Beschreibung</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Kosten</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Verfügbar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {software.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-900">{item.types?.join(', ')}</td>
                    <td className="px-4 py-3 text-gray-900">{item.shortDescription}</td>
                    <td className="px-4 py-3 text-gray-900">{item.costs}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.available}
                        className="rounded border-gray-300 text-[#004d3d] focus:ring-[#004d3d]"
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
