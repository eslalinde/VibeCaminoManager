'use client';

import { useState } from 'react';
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

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  /** Name of the item being deleted, shown prominently (e.g., "Juan Pérez", "Comunidad 5") */
  itemName?: string;
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
  itemName,
  preview,
  loading = false,
  confirmWord = 'eliminar',
}: ConfirmDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  // Reset text when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setConfirmText('');
      onClose();
    }
  };

  const isConfirmValid = confirmText.toUpperCase() === confirmWord.toUpperCase();

  const handleConfirm = async () => {
    if (!isConfirmValid) return;
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Prominent item name */}
            {itemName && (
              <div className="px-4 py-3 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
                <p className="text-base font-bold text-red-900 break-words">
                  {itemName}
                </p>
              </div>
            )}

            {/* Preview of what will be affected */}
            {preview && preview.length > 0 && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  Se eliminará permanentemente:
                </p>
                <ul className="space-y-1.5 text-sm text-red-700 font-medium">
                  {preview.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {item}
                    </li>
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
              variant="destructive"
              onClick={handleConfirm}
              disabled={!isConfirmValid || loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
