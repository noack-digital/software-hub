'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Software } from '@prisma/client';
import { Search, Globe, Monitor, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categories = [
  { id: 'all', name: 'Alle' },
  { id: 'E-Learning & Medien', name: 'E-Learning & Medien' },
  { id: 'Webkonferenzen', name: 'Webkonferenzen' },
  { id: 'Office & Zusammenarbeit', name: 'Office & Zusammenarbeit' },
  { id: 'Umfragen', name: 'Umfragen' },
  { id: 'Live-Feedback', name: 'Live-Feedback' },
  { id: 'Lerntools', name: 'Lerntools' },
  { id: 'Projektmanagement', name: 'Projektmanagement' },
];

export function SoftwareList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: software = [], isLoading } = useQuery<Software[]>({
    queryKey: ['software', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`/api/software?${params.toString()}`);
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
            {category.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8">Lade Software...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {software.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.shortDescription}</p>
                  </div>
                  {item.types.includes('Web') ? (
                    <Globe className="h-5 w-5 text-primary" />
                  ) : (
                    <Monitor className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="mt-2 text-sm line-clamp-2">{item.description}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kosten:</span>
                    <span>{item.costs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verfügbar:</span>
                    <span>{item.available ? 'Ja' : 'Nein'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Typ:</span>
                    <span>{item.types.join(', ')}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    Website öffnen
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="px-3">
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{item.name}</DialogTitle>
                        <DialogDescription>
                          {item.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Details</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Kosten</dt>
                            <dd>{item.costs}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Verfügbar</dt>
                            <dd>{item.available ? 'Ja' : 'Nein'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Typ</dt>
                            <dd>{item.types.join(', ')}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">URL</dt>
                            <dd><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.url}</a></dd>
                          </div>
                        </dl>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
