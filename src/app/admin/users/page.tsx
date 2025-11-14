'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { UserDialog } from './components/UserDialog';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { PasswordResetDialog } from './components/PasswordResetDialog';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  password?: string;
}

export default function UserManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Benutzer abrufen
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?q=${searchQuery}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
  });

  // Benutzer erstellen
  const createUserMutation = useMutation({
    mutationFn: async (userData: Omit<User, 'id' | 'createdAt'>) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Erstellen des Benutzers');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Benutzer aktualisieren
  const updateUserMutation = useMutation({
    mutationFn: async (userData: User) => {
      const { id, ...rest } = userData;
      // Wenn kein Passwort angegeben wurde, entfernen wir es aus der Anfrage
      if (!rest.password) {
        delete rest.password;
      }
      
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rest),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Aktualisieren des Benutzers');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Passwort zurücksetzen
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Wir müssen die bestehenden Benutzerdaten beibehalten
          name: selectedUser?.name || '',
          email: selectedUser?.email || '',
          role: selectedUser?.role || 'USER',
          password: newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Zurücksetzen des Passworts');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Benutzer löschen
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Löschen des Benutzers');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Benutzer wurde erfolgreich gelöscht');
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Dialog zum Erstellen eines neuen Benutzers öffnen
  const handleNewUser = () => {
    setSelectedUser(null);
    setIsCreateDialogOpen(true);
  };

  // Dialog zum Bearbeiten eines Benutzers öffnen
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Dialog zum Zurücksetzen des Passworts öffnen
  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsPasswordResetDialogOpen(true);
  };

  // Dialog zum Löschen eines Benutzers öffnen
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Benutzer erstellen
  const handleCreateUser = async (userData: User) => {
    await createUserMutation.mutateAsync(userData);
  };

  // Benutzer aktualisieren
  const handleUpdateUser = async (userData: User) => {
    await updateUserMutation.mutateAsync(userData);
  };

  // Passwort zurücksetzen
  const handleResetUserPassword = async (userId: string, newPassword: string) => {
    await resetPasswordMutation.mutateAsync({ userId, newPassword });
  };

  // Benutzer löschen
  const handleConfirmDelete = async () => {
    if (selectedUser) {
      await deleteUserMutation.mutateAsync(selectedUser.id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#004d3d' }}>
          Benutzerverwaltung
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleNewUser}
            className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: '#004d3d' }}
          >
            <Plus className="h-4 w-4 mr-2 inline-block" />
            Neuen Benutzer anlegen
          </button>
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/admin')}
            className="text-sm font-medium hover:text-gray-900"
            style={{ color: '#004d3d' }}
          >
            ← Zurück zum Dashboard
          </button>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: '#004d3d' }} />
            <input
              type="text"
              placeholder="Benutzer suchen..."
              className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="text-gray-600">Lädt...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">E-Mail</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Rolle</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Erstellt am</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-gray-900">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium"
                          style={{ backgroundColor: '#004d3d1a', color: '#004d3d' }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          className="font-medium mr-3 hover:opacity-80"
                          style={{ color: '#004d3d' }}
                          onClick={() => handleEditUser(user)}
                        >
                          Bearbeiten
                        </button>
                        <button 
                          className="font-medium mr-3 hover:opacity-80"
                          style={{ color: '#004d3d' }}
                          onClick={() => handleResetPassword(user)}
                        >
                          Passwort
                        </button>
                        <button 
                          className="font-medium text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteUser(user)}
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dialog zum Erstellen eines neuen Benutzers */}
      <UserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleCreateUser}
        mode="create"
      />

      {/* Dialog zum Bearbeiten eines Benutzers */}
      {selectedUser && (
        <UserDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleUpdateUser}
          user={selectedUser}
          mode="edit"
        />
      )}

      {/* Dialog zum Zurücksetzen des Passworts */}
      {selectedUser && (
        <PasswordResetDialog
          isOpen={isPasswordResetDialogOpen}
          onClose={() => setIsPasswordResetDialogOpen(false)}
          onReset={handleResetUserPassword}
          userId={selectedUser.id}
          userName={selectedUser.name}
        />
      )}

      {/* Dialog zum Löschen eines Benutzers */}
      {selectedUser && (
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          userName={selectedUser.name}
        />
      )}
    </div>
  );
}
