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
import { createClient } from '@/utils/supabase/client';
import { Person } from '@/types/database';
import { normalizeText } from '@/lib/utils';

interface SelectPersonForTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (personId: number) => Promise<void>;
  excludePersonIds: number[];
}

export function SelectPersonForTeamModal({
  open,
  onClose,
  onSelect,
  excludePersonIds,
}: SelectPersonForTeamModalProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchAvailablePeople();
      setSearchTerm('');
      setSelectedPersonId(null);
      setError(null);
    }
  }, [open, JSON.stringify(excludePersonIds)]);

  const fetchAvailablePeople = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .order('person_name', { ascending: true });

      if (peopleError) throw peopleError;

      // Filter out people already in the team
      const excludeSet = new Set(excludePersonIds);
      const availablePeople = (peopleData || []).filter(
        (person) => !excludeSet.has(person.id!)
      );

      setPeople(availablePeople);
    } catch (err: any) {
      console.error('Error fetching available people:', err);
      setError(err.message || 'Error al cargar las personas disponibles');
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = people.filter((person) =>
    normalizeText(person.person_name).includes(normalizeText(searchTerm))
  );

  const handleSelect = async () => {
    if (!selectedPersonId) {
      setError('Por favor selecciona una persona');
      return;
    }

    try {
      await onSelect(selectedPersonId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al agregar la persona');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <Theme>
          <DialogHeader>
            <DialogTitle>Agregar Persona Existente</DialogTitle>
            <DialogDescription>
              Selecciona una persona para agregarla al equipo nacional.
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

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando personas disponibles...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredPeople.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? 'No se encontraron personas con ese nombre'
                  : 'No hay personas disponibles'}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPeople.map((person) => (
                  <div
                    key={person.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPersonId === person.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPersonId(person.id!)}
                  >
                    <div className="font-medium">{person.person_name}</div>
                    <div className="text-sm text-gray-500">
                      {person.mobile && `Celular: ${person.mobile}`}
                      {person.email && ` · Email: ${person.email}`}
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
            <Button onClick={handleSelect} disabled={!selectedPersonId || loading}>
              Agregar Persona
            </Button>
          </DialogFooter>
        </Theme>
      </DialogContent>
    </Dialog>
  );
}
