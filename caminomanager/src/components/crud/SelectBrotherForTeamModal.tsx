'use client';

import { useState, useMemo } from 'react';
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
import { MergedBrother } from '@/hooks/useCommunityData';
import { Belongs } from '@/types/database';

interface SelectBrotherForTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (personIds: number[]) => Promise<void>;
  brothers: MergedBrother[];
  teamMembers: Belongs[];
}

export function SelectBrotherForTeamModal({
  open,
  onClose,
  onSelect,
  brothers,
  teamMembers,
}: SelectBrotherForTeamModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrotherId, setSelectedBrotherId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter out brothers already in the team
  const availableBrothers = useMemo(() => {
    const teamPersonIds = new Set(teamMembers.map((m) => m.person_id));
    return brothers.filter(
      (b) => !b.personIds.every((pid) => teamPersonIds.has(pid))
    );
  }, [brothers, teamMembers]);

  const filteredBrothers = availableBrothers.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedBrotherId(null);
      setError(null);
      onClose();
    }
  };

  const handleSelect = async () => {
    if (!selectedBrotherId) {
      setError('Por favor selecciona un hermano');
      return;
    }

    const brother = availableBrothers.find((b) => b.id === selectedBrotherId);
    if (!brother) return;

    try {
      await onSelect(brother.personIds);
      setSearchTerm('');
      setSelectedBrotherId(null);
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al agregar al equipo');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <Theme>
          <DialogHeader>
            <DialogTitle>Agregar Hermano al Equipo</DialogTitle>
            <DialogDescription>
              Selecciona un hermano de la comunidad para agregarlo a este equipo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-center py-2 text-red-500">{error}</div>
            )}

            {filteredBrothers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? 'No se encontraron hermanos con ese nombre'
                  : 'Todos los hermanos ya están en este equipo'}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredBrothers.map((brother) => (
                  <div
                    key={brother.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBrotherId === brother.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedBrotherId(brother.id)}
                  >
                    <div className="font-medium">
                      {brother.name}
                      {brother.isMarriage && (
                        <span className="ml-2 text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                          Matrimonio
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {brother.carisma && `${brother.carisma}`}
                      {brother.celular && ` · Celular: ${brother.celular}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSelect} disabled={!selectedBrotherId}>
              Agregar al Equipo
            </Button>
          </DialogFooter>
        </Theme>
      </DialogContent>
    </Dialog>
  );
}
