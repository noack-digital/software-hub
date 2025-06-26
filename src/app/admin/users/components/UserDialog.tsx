'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => Promise<void>;
  user?: User | null;
  mode: 'create' | 'edit';
}

export function UserDialog({ isOpen, onClose, onSave, user, mode }: UserDialogProps) {
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    role: 'USER',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        password: '', // Passwort wird beim Bearbeiten nicht geladen
      });
    } else {
      // Bei Neuanlage Formular zurücksetzen
      setFormData({
        name: '',
        email: '',
        role: 'USER',
        password: '',
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (mode === 'create' && formData.password && formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSave(formData);
      onClose();
      toast.success(
        mode === 'create' 
          ? 'Benutzer wurde erfolgreich erstellt' 
          : 'Benutzer wurde erfolgreich aktualisiert'
      );
    } catch (error: any) {
      toast.error(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Fehler für das Feld zurücksetzen
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neuen Benutzer anlegen' : 'Benutzer bearbeiten'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Max Mustermann"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="max.mustermann@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Rolle</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="USER">Benutzer</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            
            {(mode === 'create' || formData.password) && (
              <div className="grid gap-2">
                <Label htmlFor="password">
                  {mode === 'create' ? 'Passwort' : 'Neues Passwort (optional)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={mode === 'create' ? 'Passwort eingeben' : 'Leer lassen, um nicht zu ändern'}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#004d3d' }}
            >
              {isLoading ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
