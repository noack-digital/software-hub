'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PasswordResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: (userId: string, newPassword: string) => Promise<void>;
  userId: string;
  userName: string;
}

export function PasswordResetDialog({ 
  isOpen, 
  onClose, 
  onReset, 
  userId, 
  userName 
}: PasswordResetDialogProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newPassword) {
      newErrors.password = 'Neues Passwort ist erforderlich';
    } else if (newPassword.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Passwortbestätigung ist erforderlich';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
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
      await onReset(userId, newPassword);
      onClose();
      toast.success('Passwort wurde erfolgreich zurückgesetzt');
      
      // Formular zurücksetzen
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Passwort zurücksetzen für {userName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">Neues Passwort</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Neues Passwort eingeben"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Passwort bestätigen</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort bestätigen"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#004d3d' }}
            >
              {isLoading ? 'Wird zurückgesetzt...' : 'Passwort zurücksetzen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
