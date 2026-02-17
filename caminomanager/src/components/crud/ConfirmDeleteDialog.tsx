'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Theme } from '@radix-ui/themes';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  /** Optional details shown in a preview box (e.g., "3 hermanos, 2 equipos") */
  preview?: string[];
  loading?: boolean;
  /** The word the user must type to confirm. Defaults to "ELIMINAR" */
  confirmWord?: string;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  preview,
  loading = false,
  confirmWord = 'ELIMINAR',
}: ConfirmDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  // Reset text when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmText('');
    }
  }, [open]);

  const isConfirmValid = confirmText === confirmWord;

  const handleConfirm = async () => {
    if (!isConfirmValid) return;
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <Theme>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Preview of what will be affected */}
            {preview && preview.length > 0 && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Se eliminará:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {preview.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confirmation text input */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
              <p className="text-sm text-red-700 font-medium">
                Esta acción es IRREVERSIBLE.
              </p>
              <p className="text-sm text-red-600">
                Escribe <span className="font-bold">{confirmWord}</span> para confirmar:
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Escribe ${confirmWord}`}
                disabled={loading}
                className="border-red-300 focus:ring-red-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleConfirm}
              disabled={!isConfirmValid || loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </Theme>
      </DialogContent>
    </Dialog>
  );
}
