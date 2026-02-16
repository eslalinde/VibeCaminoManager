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

interface SelectPriestModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (personId: number, isParishPriest: boolean) => Promise<void>;
  parishId: number;
}

export function SelectPriestModal({
  open,
  onClose,
  onSelect,
  parishId,
}: SelectPriestModalProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<boolean>(false); // false = Vicario, true = Párroco
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchAvailablePeople();
      setSearchTerm('');
      setSelectedPersonId(null);
      setSelectedRole(false);
      setError(null);
    }
  }, [open, parishId]);

  const fetchAvailablePeople = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      // Get person IDs already assigned as priests to this parish
      const { data: priestsData, error: priestsError } = await supabase
        .from('priests')
        .select('person_id')
        .eq('parish_id', parishId);

      if (priestsError) throw priestsError;

      const assignedPersonIds = new Set(
        (priestsData || []).map((p) => p.person_id)
      );

      // Get all people with person_type_id = 3 (Presbítero)
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .eq('person_type_id', 3)
        .order('person_name', { ascending: true });

      if (peopleError) throw peopleError;

      // Filter out people already assigned to this parish
      const availablePeople = (peopleData || []).filter(
        (person) => !assignedPersonIds.has(person.id!)
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
      await onSelect(selectedPersonId, selectedRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al asignar el sacerdote');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <Theme>
          <DialogHeader>
            <DialogTitle>Asignar Sacerdote Existente</DialogTitle>
            <DialogDescription>
              Selecciona un presbítero para asignarlo a esta parroquia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Buscador */}
            <div>
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lista de personas disponibles */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando presbíteros disponibles...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredPeople.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? 'No se encontraron presbíteros con ese nombre'
                  : 'No hay presbíteros disponibles para asignar'}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
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

            {/* Selector de rol */}
            {selectedPersonId && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rol en la parroquia:
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      !selectedRole
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRole(false)}
                  >
                    Vicario
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedRole
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRole(true)}
                  >
                    Párroco
                  </button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSelect} disabled={!selectedPersonId || loading}>
              Asignar Sacerdote
            </Button>
          </DialogFooter>
        </Theme>
      </DialogContent>
    </Dialog>
  );
}
