import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Priest, Person } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import { Trash2, UserPlus, Plus } from 'lucide-react';
import { SelectPriestModal } from './SelectPriestModal';

interface PriestsListProps {
  priests: Priest[];
  loading?: boolean;
  parishId: number;
  onRefresh?: () => void;
}

export function PriestsList({ priests, loading, parishId, onRefresh }: PriestsListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New priest form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<boolean>(false);

  const resetCreateForm = () => {
    setNewName('');
    setNewPhone('');
    setNewMobile('');
    setNewEmail('');
    setNewRole(false);
  };

  const handleDelete = async (priest: Priest) => {
    const personName = priest.person?.person_name || 'este sacerdote';
    if (!window.confirm(`¿Estás seguro de que deseas remover a ${personName} de esta parroquia?`)) {
      return;
    }

    setDeletingId(priest.id!);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('priests')
        .delete()
        .eq('id', priest.id);

      if (error) throw error;

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting priest:', error);
      alert('Error al eliminar el sacerdote. Por favor, intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleRole = async (priest: Priest) => {
    setTogglingId(priest.id!);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('priests')
        .update({ is_parish_priest: !priest.is_parish_priest })
        .eq('id', priest.id);

      if (error) throw error;

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error toggling priest role:', error);
      alert('Error al cambiar el rol. Por favor, intenta de nuevo.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSelectExistingPriest = async (personId: number, isParishPriest: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('priests')
      .insert({
        person_id: personId,
        parish_id: parishId,
        is_parish_priest: isParishPriest,
      });

    if (error) throw error;

    if (onRefresh) onRefresh();
  };

  const handleCreateNewPriest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('El nombre es requerido');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();

      // Create the person with person_type_id = 3 (Presbítero)
      const { data: newPerson, error: personError } = await supabase
        .from('people')
        .insert({
          person_name: newName.trim(),
          phone: newPhone.trim() || null,
          mobile: newMobile.trim() || null,
          email: newEmail.trim() || null,
          person_type_id: 3,
        })
        .select()
        .single();

      if (personError) throw personError;

      // Create the priest relationship
      const { error: priestError } = await supabase
        .from('priests')
        .insert({
          person_id: newPerson.id,
          parish_id: parishId,
          is_parish_priest: newRole,
        });

      if (priestError) throw priestError;

      if (onRefresh) onRefresh();
      setIsCreateModalOpen(false);
      resetCreateForm();
    } catch (error: any) {
      console.error('Error creating new priest:', error);
      alert(error.message || 'Error al crear el sacerdote. Por favor, intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Cargando sacerdotes...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Sacerdotes de la Parroquia</CardTitle>
              <p className="text-sm text-gray-600">
                Total: {priests.length} {priests.length === 1 ? 'sacerdote' : 'sacerdotes'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="2"
                variant="outline"
                onClick={() => setIsSelectModalOpen(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Asignar Existente
              </Button>
              <Button
                size="2"
                onClick={() => {
                  resetCreateForm();
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Sacerdote
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No hay sacerdotes asignados
                    </TableCell>
                  </TableRow>
                ) : (
                  priests.map((priest) => {
                    const isDeleting = deletingId === priest.id;
                    const isToggling = togglingId === priest.id;

                    return (
                      <TableRow key={priest.id}>
                        <TableCell className="font-medium">
                          {priest.person?.person_name || 'Sin nombre'}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleToggleRole(priest)}
                            disabled={isToggling}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                              priest.is_parish_priest
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                            title="Clic para cambiar rol"
                          >
                            {isToggling ? '...' : priest.is_parish_priest ? 'Párroco' : 'Vicario'}
                          </button>
                        </TableCell>
                        <TableCell>{priest.person?.phone || priest.person?.mobile || '-'}</TableCell>
                        <TableCell>{priest.person?.email || '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="1"
                            variant="outline"
                            radius="small"
                            color="red"
                            onClick={() => handleDelete(priest)}
                            disabled={isDeleting}
                            title="Remover sacerdote de la parroquia"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para seleccionar sacerdote existente */}
      <SelectPriestModal
        open={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSelect={handleSelectExistingPriest}
        parishId={parishId}
      />

      {/* Modal para crear nuevo sacerdote */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Nuevo Sacerdote</h2>

            <form onSubmit={handleCreateNewPriest} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rol en la parroquia:
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      !newRole
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setNewRole(false)}
                  >
                    Vicario
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      newRole
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setNewRole(true)}
                  >
                    Párroco
                  </button>
                </div>
              </div>

              {/* Person fields */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre *</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ingrese el nombre completo"
                  required
                  maxLength={256}
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Teléfono</label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Ingrese el número de teléfono"
                  maxLength={50}
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Celular</label>
                <Input
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="Ingrese el número de celular"
                  maxLength={50}
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Correo electrónico</label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ingrese el correo electrónico"
                  maxLength={256}
                  disabled={isSaving}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
