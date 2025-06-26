'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface FooterLink {
  id: string;
  text: string;
  url: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditingLink {
  id?: string;
  text: string;
  url: string;
  order: number;
  isActive: boolean;
}

export default function FooterSettingsPage() {
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<EditingLink | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Footer-Links laden
  const fetchFooterLinks = async () => {
    try {
      const response = await fetch('/api/footer-links');
      if (response.ok) {
        const data = await response.json();
        setFooterLinks(data);
      } else {
        toast.error('Fehler beim Laden der Footer-Links');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Footer-Links:', error);
      toast.error('Fehler beim Laden der Footer-Links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterLinks();
  }, []);

  // Neuen Link erstellen
  const handleCreate = async () => {
    if (!editingLink) return;

    try {
      const response = await fetch('/api/footer-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingLink),
      });

      if (response.ok) {
        toast.success('Footer-Link erfolgreich erstellt');
        setIsCreating(false);
        setEditingLink(null);
        fetchFooterLinks();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Fehler beim Erstellen des Footer-Links');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Footer-Links:', error);
      toast.error('Fehler beim Erstellen des Footer-Links');
    }
  };

  // Link aktualisieren
  const handleUpdate = async () => {
    if (!editingLink || !editingLink.id) return;

    try {
      const response = await fetch('/api/footer-links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingLink),
      });

      if (response.ok) {
        toast.success('Footer-Link erfolgreich aktualisiert');
        setEditingLink(null);
        fetchFooterLinks();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Fehler beim Aktualisieren des Footer-Links');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Footer-Links:', error);
      toast.error('Fehler beim Aktualisieren des Footer-Links');
    }
  };

  // Link löschen
  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Footer-Link löschen möchten?')) {
      return;
    }

    try {
      const response = await fetch(`/api/footer-links?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Footer-Link erfolgreich gelöscht');
        fetchFooterLinks();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Fehler beim Löschen des Footer-Links');
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Footer-Links:', error);
      toast.error('Fehler beim Löschen des Footer-Links');
    }
  };

  // Bearbeitung starten
  const startEdit = (link: FooterLink) => {
    setEditingLink({
      id: link.id,
      text: link.text,
      url: link.url,
      order: link.order,
      isActive: link.isActive,
    });
  };

  // Neue Erstellung starten
  const startCreate = () => {
    setIsCreating(true);
    setEditingLink({
      text: '',
      url: '',
      order: footerLinks.length,
      isActive: true,
    });
  };

  // Bearbeitung abbrechen
  const cancelEdit = () => {
    setEditingLink(null);
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Footer-Verwaltung</h1>
            <p className="text-gray-600 mt-2">
              Verwalten Sie die Links im Footer der Website
            </p>
          </div>
          <button
            onClick={startCreate}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Neuer Link
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Footer-Links</h2>
            
            {/* Neue Erstellung */}
            {isCreating && editingLink && (
              <div className="border border-blue-200 rounded-lg p-4 mb-4 bg-blue-50">
                <h3 className="font-medium mb-3">Neuen Footer-Link erstellen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ankertext
                    </label>
                    <input
                      type="text"
                      value={editingLink.text}
                      onChange={(e) => setEditingLink({ ...editingLink, text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. Datenschutz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="url"
                      value={editingLink.url}
                      onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/datenschutz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reihenfolge
                    </label>
                    <input
                      type="number"
                      value={editingLink.order}
                      onChange={(e) => setEditingLink({ ...editingLink, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingLink.isActive}
                        onChange={(e) => setEditingLink({ ...editingLink, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      Aktiv
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleCreate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Speichern
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {/* Footer-Links Liste */}
            <div className="space-y-4">
              {footerLinks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Keine Footer-Links vorhanden. Erstellen Sie den ersten Link.
                </p>
              ) : (
                footerLinks.map((link) => (
                  <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                    {editingLink?.id === link.id ? (
                      // Bearbeitungsmodus
                      <div>
                        <h3 className="font-medium mb-3">Footer-Link bearbeiten</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ankertext
                            </label>
                            <input
                              type="text"
                              value={editingLink.text}
                              onChange={(e) => setEditingLink({ ...editingLink, text: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              URL
                            </label>
                            <input
                              type="url"
                              value={editingLink.url}
                              onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Reihenfolge
                            </label>
                            <input
                              type="number"
                              value={editingLink.order}
                              onChange={(e) => setEditingLink({ ...editingLink, order: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editingLink.isActive}
                                onChange={(e) => setEditingLink({ ...editingLink, isActive: e.target.checked })}
                                className="mr-2"
                              />
                              Aktiv
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={handleUpdate}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Speichern
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Anzeigemodus
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <GripVertical className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{link.text}</span>
                              {!link.isActive && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  Inaktiv
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {link.url}
                              </a>
                            </div>
                            <div className="text-xs text-gray-500">
                              Reihenfolge: {link.order}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(link)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Hinweise */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Hinweise zur Footer-Verwaltung</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Links werden automatisch nach der Reihenfolge sortiert</li>
            <li>• Inaktive Links werden nicht im Footer angezeigt</li>
            <li>• URLs sollten vollständig sein (mit http:// oder https://)</li>
            <li>• Standardlinks wie "Datenschutz" und "Impressum" können hier verwaltet werden</li>
          </ul>
        </div>
      </div>
    </div>
  );
}