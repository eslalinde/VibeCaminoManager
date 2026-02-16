import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Theme } from '@radix-ui/themes';
import { Team, Belongs, Parish } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import { Trash2, UserMinus, Crown, UserPlus, Pencil } from 'lucide-react';
import { getCarismaLabel } from '@/config/carisma';

interface TeamSectionProps {
  team: Team;
  members: Belongs[];
  parishes: Parish[];
  loading?: boolean;
  teamNumber?: number;
  communityId: number | null;
  onDelete?: () => void;
  onAddMember?: () => void;
  onEditMember?: (personId: number) => void;
}

export function TeamSection({ team, members, parishes, loading, teamNumber, communityId, onDelete, onAddMember, onEditMember }: TeamSectionProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [removingResponsibleId, setRemovingResponsibleId] = useState<string | null>(null);
  const [assigningResponsibleId, setAssigningResponsibleId] = useState<string | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando equipo...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Merge married couples in team members
  const mergedMembers = (() => {
    const processedIds = new Set<number>();
    const merged: Array<{
      id: string;
      name: string;
      carisma: string;
      mobile: string;
      isResponsible: boolean;
      isMarriage: boolean;
      isPresbitero: boolean;
      personIds: number[];
      belongsIds: number[]; // IDs de los registros belongs para poder actualizarlos
    }> = [];

    members.forEach(member => {
      if (processedIds.has(member.person_id)) return;

      const person = member.person;
      if (!person) return;

      // Check if this person is married and spouse is also in the team
      if (person.spouse_id) {
        const spouseMember = members.find(m => 
          m.person_id === person.spouse_id && 
          !processedIds.has(m.person_id)
        );

        if (spouseMember && spouseMember.person) {
          // Create merged marriage entry
          const husband = person.gender_id === 1 ? person : spouseMember.person;
          const wife = person.gender_id === 2 ? person : spouseMember.person;
          
          merged.push({
            id: `marriage-${person.id}-${spouseMember.person_id}`,
            name: `${husband.person_name} y ${wife.person_name}`,
            carisma: 'Casado',
            mobile: husband.mobile || wife.mobile || '',
            isResponsible: member.is_responsible_for_the_team || spouseMember.is_responsible_for_the_team,
            isMarriage: true,
            isPresbitero: false, // Married couples are not presbíteros
            personIds: [person.id!, spouseMember.person_id],
            belongsIds: [
              ...(member.id ? [member.id] : []),
              ...(spouseMember.id ? [spouseMember.id] : [])
            ]
          });

          if (person.id) processedIds.add(person.id);
          if (spouseMember.person_id) processedIds.add(spouseMember.person_id);
          return;
        }
      }

      // Single person
      const carisma = getCarismaLabel(person.person_type_id) || 'No especificado';
      merged.push({
        id: `person-${person.id}`,
        name: person.person_name,
        carisma,
        mobile: person.mobile || '',
        isResponsible: member.is_responsible_for_the_team,
        isMarriage: false,
        isPresbitero: person.person_type_id === 3, // person_type_id 3 = Presbítero
        personIds: [person.id!],
        belongsIds: member.id ? [member.id] : []
      });

      if (person.id) processedIds.add(person.id);
    });

    // Ordenar por nombre
    return merged.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  })();

  // Verificar si ya existe un responsable en el equipo
  const hasResponsible = mergedMembers.some(member => member.isResponsible);

  const handleDelete = async (member: { id: string; name: string; personIds: number[]; belongsIds: number[] }) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${member.name} de este equipo?`)) {
      return;
    }

    setDeletingId(member.id);
    try {
      const supabase = createClient();

      // Delete belongs records directly by their IDs
      if (member.belongsIds.length > 0) {
        const { error, count } = await supabase
          .from('belongs')
          .delete({ count: 'exact' })
          .in('id', member.belongsIds);

        if (error) throw error;
        if (count === 0) {
          throw new Error('No tienes permisos para eliminar miembros del equipo. Contacta al administrador.');
        }
      }

      // Refresh the community data
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Error al eliminar el miembro del equipo. Por favor, intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveResponsible = async (member: { id: string; name: string; belongsIds: number[] }) => {
    if (!window.confirm(`¿Estás seguro de que deseas quitar la responsabilidad a ${member.name}? La persona permanecerá en el equipo como corresponsable.`)) {
      return;
    }

    setRemovingResponsibleId(member.id);
    try {
      const supabase = createClient();
      
      // Update all belongs records to set is_responsible_for_the_team to false
      for (const belongsId of member.belongsIds) {
        const { error } = await supabase
          .from('belongs')
          .update({ is_responsible_for_the_team: false })
          .eq('id', belongsId);

        if (error) throw error;
      }

      // Refresh the community data
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error removing responsible:', error);
      alert('Error al quitar la responsabilidad. Por favor, intenta de nuevo.');
    } finally {
      setRemovingResponsibleId(null);
    }
  };

  const handleAssignResponsible = async (member: { id: string; name: string; belongsIds: number[] }) => {
    if (!window.confirm(`¿Estás seguro de que deseas asignar la responsabilidad a ${member.name}?${hasResponsible ? ' Esto quitará la responsabilidad del responsable actual.' : ''}`)) {
      return;
    }

    setAssigningResponsibleId(member.id);
    try {
      const supabase = createClient();
      
      // Primero, quitar la responsabilidad de todos los demás miembros del equipo
      if (hasResponsible) {
        // Obtener todos los registros belongs de este equipo que tienen is_responsible_for_the_team = true
        const { data: currentResponsibles, error: fetchError } = await supabase
          .from('belongs')
          .select('id')
          .eq('team_id', team.id)
          .eq('is_responsible_for_the_team', true);

        if (fetchError) throw fetchError;

        // Quitar la responsabilidad de todos los responsables actuales
        if (currentResponsibles && currentResponsibles.length > 0) {
          const responsibleIds = currentResponsibles.map(r => r.id);
          const { error: updateError } = await supabase
            .from('belongs')
            .update({ is_responsible_for_the_team: false })
            .in('id', responsibleIds);

          if (updateError) throw updateError;
        }
      }
      
      // Luego, asignar la responsabilidad al nuevo miembro
      for (const belongsId of member.belongsIds) {
        const { error } = await supabase
          .from('belongs')
          .update({ is_responsible_for_the_team: true })
          .eq('id', belongsId);

        if (error) throw error;
      }

      // Refresh the community data
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error assigning responsible:', error);
      alert('Error al asignar la responsabilidad. Por favor, intenta de nuevo.');
    } finally {
      setAssigningResponsibleId(null);
    }
  };

  const getTeamTitle = () => {
    if (team.team_type_id === 4) {
      return 'Equipo de Responsables';
    } else if (team.team_type_id === 3) {
      return teamNumber ? `Equipo de Catequistas ${teamNumber}` : 'Equipo de Catequistas';
    }
    return team.name;
  };

  const handleDeleteTeam = async () => {
    setShowDeleteDialog(false);
    setDeletingTeam(true);
    try {
      const supabase = createClient();
      
      // 1. Eliminar todos los registros de belongs asociados al equipo
      const { error: belongsError } = await supabase
        .from('belongs')
        .delete()
        .eq('team_id', team.id);

      if (belongsError) throw belongsError;

      // 2. Eliminar todos los registros de parish_teams asociados al equipo
      const { error: parishTeamsError } = await supabase
        .from('parish_teams')
        .delete()
        .eq('team_id', team.id);

      if (parishTeamsError) throw parishTeamsError;

      // 3. Eliminar el equipo
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);

      if (teamError) throw teamError;

      // Refresh the community data
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error al eliminar el equipo. Por favor, intenta de nuevo.');
    } finally {
      setDeletingTeam(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getTeamTitle()}</CardTitle>
          <div className="flex items-center gap-2 print-hidden">
            {onAddMember && (
              <Button
                size="1"
                variant="outline"
                radius="small"
                onClick={onAddMember}
                disabled={deletingTeam || deletingId !== null}
                title="Agregar miembro al equipo"
              >
                <UserPlus className="h-4 w-4" />
                Agregar
              </Button>
            )}
            <Button
              size="1"
              variant="outline"
              radius="small"
              color="red"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deletingTeam || deletingId !== null || removingResponsibleId !== null || assigningResponsibleId !== null}
              title="Eliminar equipo completo"
            >
              <Trash2 className="h-4 w-4" />
              {deletingTeam ? 'Eliminando...' : 'Eliminar Equipo'}
            </Button>
          </div>
        </div>
        {team.team_type_id === 3 && parishes.length > 0 && (
          <div className="mt-2">
            <div className="space-y-1">
              {parishes.map((parish) => (
                <p key={parish.id} className="text-sm text-gray-600">
                  Lleva {parish.name}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead className="print-hidden">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                    No hay miembros en este equipo
                  </TableCell>
                </TableRow>
              ) : (
                mergedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.name}
                      {team.team_type_id === 3 ? (
                        <>
                          {member.isResponsible && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Responsable
                            </span>
                          )}
                          {member.isPresbitero && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              Presbítero
                            </span>
                          )}
                          {member.carisma === 'Itinerante' && (
                            <span className="ml-2 text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                              Itinerante
                            </span>
                          )}
                          {member.carisma === 'Seminarista' && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Seminarista
                            </span>
                          )}
                          {member.carisma === 'Soltero' && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              Soltero
                            </span>
                          )}
                          {member.carisma === 'Diácono' && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Diácono
                            </span>
                          )}
                          {member.carisma === 'Monja' && (
                            <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                              Monja
                            </span>
                          )}
                          {member.carisma === 'Viudo' && (
                            <span className="ml-2 text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                              Viudo
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {member.isResponsible ? (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Responsable
                            </span>
                          ) : (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              Corresponsable
                            </span>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.mobile || '-'}
                    </TableCell>
                    <TableCell className="print-hidden">
                      <div className="flex gap-2">
                        {onEditMember && (
                          <Button
                            size="1"
                            variant="outline"
                            radius="small"
                            onClick={() => onEditMember(member.personIds[0])}
                            disabled={deletingId === member.id || removingResponsibleId === member.id || assigningResponsibleId === member.id}
                            title="Editar persona"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                        {member.isResponsible ? (
                          <Button
                            size="1"
                            variant="outline"
                            radius="small"
                            color="orange"
                            onClick={() => handleRemoveResponsible(member)}
                            disabled={removingResponsibleId === member.id || deletingId === member.id || assigningResponsibleId === member.id}
                            title="Quitar responsabilidad (la persona permanecerá en el equipo)"
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="1"
                            variant="outline"
                            radius="small"
                            color="green"
                            onClick={() => handleAssignResponsible(member)}
                            disabled={hasResponsible || assigningResponsibleId === member.id || deletingId === member.id || removingResponsibleId === member.id}
                            title={hasResponsible ? "Ya existe un responsable en el equipo. Quita la responsabilidad del actual para asignar a otro." : "Asignar responsabilidad"}
                          >
                            <Crown className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="1"
                          variant="outline"
                          radius="small"
                          color="red"
                          onClick={() => handleDelete(member)}
                          disabled={deletingId === member.id || removingResponsibleId === member.id || assigningResponsibleId === member.id}
                          title="Eliminar miembro del equipo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Diálogo de confirmación para eliminar equipo */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <Theme>
            <DialogHeader>
              <DialogTitle>¿Eliminar equipo?</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar el {getTeamTitle()}? Esta acción eliminará el equipo y todos sus miembros. Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deletingTeam}
              >
                Cancelar
              </Button>
              <Button
                color="red"
                onClick={handleDeleteTeam}
                disabled={deletingTeam}
              >
                {deletingTeam ? 'Eliminando...' : 'Eliminar Equipo'}
              </Button>
            </DialogFooter>
          </Theme>
        </DialogContent>
      </Dialog>
    </Card>
  );
}