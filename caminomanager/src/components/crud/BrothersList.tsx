import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MergedBrother } from '@/hooks/useCommunityData';
import { Belongs, Person } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import { Trash2, UserPlus, Plus } from 'lucide-react';
import { SelectBrotherModal } from './SelectBrotherModal';
import { DynamicEntityModal } from './DynamicEntityModal';
import { personConfig } from '@/config/entities';

interface BrothersListProps {
  brothers: MergedBrother[];
  loading?: boolean;
  communityId: number;
  teamMembers: Record<number, Belongs[]>;
  onDelete?: () => void;
  onAdd?: () => void;
}

export function BrothersList({ brothers, loading, communityId, teamMembers, onDelete, onAdd }: BrothersListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if a brother is associated with any team
  const isBrotherInTeam = (brother: MergedBrother): boolean => {
    // Get all person IDs from all teams in this community
    const allTeamPersonIds = new Set<number>();
    Object.values(teamMembers).forEach(members => {
      members.forEach(member => {
        // Verify the member belongs to this community
        if (member.person_id && member.community_id === communityId) {
          allTeamPersonIds.add(member.person_id);
        }
      });
    });

    // Check if any of the brother's person IDs are in any team
    return brother.personIds.some(personId => allTeamPersonIds.has(personId));
  };

  const handleDelete = async (brother: MergedBrother) => {
    if (isBrotherInTeam(brother)) {
      alert('No se puede eliminar este hermano porque está asociado a un equipo dentro de la comunidad.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${brother.name} de esta comunidad?`)) {
      return;
    }

    setDeletingId(brother.id);
    try {
      const supabase = createClient();
      
      // Delete all brother records for all person IDs in this merged brother
      for (const personId of brother.personIds) {
        const { error } = await supabase
          .from('brothers')
          .delete()
          .eq('person_id', personId)
          .eq('community_id', communityId);

        if (error) throw error;
      }

      // Refresh the community data
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting brother:', error);
      alert('Error al eliminar el hermano. Por favor, intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectExistingBrother = async (personId: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('brothers')
      .insert({
        person_id: personId,
        community_id: communityId,
      });

    if (error) throw error;

    // Refresh the community data
    if (onAdd) {
      onAdd();
    }
  };

  const handleCreateNewBrother = async (data: Omit<Person, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSaving(true);
    try {
      const supabase = createClient();

      // First, create the person
      const { data: newPerson, error: personError } = await supabase
        .from('people')
        .insert(data)
        .select()
        .single();

      if (personError) throw personError;

      // Then, create the brother relationship
      const { error: brotherError } = await supabase
        .from('brothers')
        .insert({
          person_id: newPerson.id,
          community_id: communityId,
        });

      if (brotherError) throw brotherError;

      // Refresh the community data
      if (onAdd) {
        onAdd();
      }
    } catch (error: any) {
      console.error('Error creating new brother:', error);
      alert(error.message || 'Error al crear el hermano. Por favor, intenta de nuevo.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Cargando hermanos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
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
              <CardTitle>Hermanos de la Comunidad</CardTitle>
              <p className="text-sm text-gray-600">
                Total: {brothers.length} {brothers.length === 1 ? 'hermano' : 'hermanos'}
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
                Agregar Existente
              </Button>
              <Button
                size="2"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Hermano
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
                <TableHead>Carisma</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brothers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No hay hermanos registrados
                  </TableCell>
                </TableRow>
              ) : (
                brothers.map((brother) => {
                  const isInTeam = isBrotherInTeam(brother);
                  const isDeleting = deletingId === brother.id;
                  
                  return (
                    <TableRow key={brother.id}>
                      <TableCell className="font-medium">
                        {brother.name}
                        {brother.isMarriage && (
                          <span className="ml-2 text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                            Matrimonio
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{brother.carisma}</TableCell>
                      <TableCell>{brother.celular || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="1"
                          variant="outline"
                          radius="small"
                          color={isInTeam ? "gray" : "red"}
                          onClick={() => handleDelete(brother)}
                          disabled={isInTeam || isDeleting}
                          title={isInTeam ? 'Este hermano está asociado a un equipo y no puede ser eliminado' : 'Eliminar hermano de la comunidad'}
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

    {/* Modal para seleccionar hermano existente */}
    <SelectBrotherModal
      open={isSelectModalOpen}
      onClose={() => setIsSelectModalOpen(false)}
      onSelect={handleSelectExistingBrother}
      communityId={communityId}
    />

    {/* Modal para crear nuevo hermano */}
    <DynamicEntityModal
      open={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      onSave={handleCreateNewBrother}
      initial={null}
      fields={personConfig.fields}
      title="Crear Nuevo Hermano"
      loading={isSaving}
    />
  </>
  );
}
