'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCommunityData } from '@/hooks/useCommunityData';
import { CommunityInfo } from '@/components/crud/CommunityInfo';
import { BrothersList } from '@/components/crud/BrothersList';
import { TeamSection } from '@/components/crud/TeamSection';
import { CommunityStepLogCompact } from '@/components/crud/CommunityStepLogCompact';
import { CommunityPrintView } from '@/components/crud/CommunityPrintView';
import { DynamicEntityModal } from '@/components/crud/DynamicEntityModal';
import { communityConfig } from '@/config/entities';
import { SelectBrotherForTeamModal } from '@/components/crud/SelectBrotherForTeamModal';
import { Button } from '@/components/ui/button';
import { MergeCommunityModal } from '@/components/crud/MergeCommunityModal';
import { ConfirmDeleteDialog } from '@/components/crud/ConfirmDeleteDialog';
import { ArrowLeft, Merge, Plus, Printer, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Community } from '@/types/database';
import { routes } from '@/lib/routes';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const communityId = parseInt(params.id as string);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addToTeamId, setAddToTeamId] = useState<number | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    community,
    mergedBrothers,
    teams,
    teamMembers,
    teamParishes,
    stepLogs,
    parishPriestName,
    loading,
    error,
    refreshCommunity
  } = useCommunityData(communityId);

  // Construir nombre de catequistas responsables del equipo por defecto
  const defaultCatechistName = useMemo(() => {
    const team = community?.cathechist_team as any;
    if (!team?.belongs) return '';
    const names = team.belongs
      .filter((b: any) => b.is_responsible_for_the_team)
      .map((b: any) => b.person?.person_name)
      .filter(Boolean);
    return names.join(' y ');
  }, [community?.cathechist_team]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = async (data: Omit<Community, 'id' | 'created_at' | 'updated_at'>) => {
    if (!community?.id) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: updatedRows, error: updateError } = await supabase
        .from('communities')
        .update(data)
        .eq('id', community.id)
        .select();

      if (updateError) throw updateError;

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('No tienes permisos para editar comunidades. Contacta al administrador para que te asigne el rol de contributor o admin.');
      }

      // Refrescar los datos de la comunidad
      await refreshCommunity();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating community:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateResponsablesTeam = async () => {
    if (!community?.id) return;
    
    try {
      const supabase = createClient();
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: `Equipo de Responsables - Comunidad ${community.number}`,
          team_type_id: 4, // Responsables
          community_id: community.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Refrescar los datos de la comunidad
      await refreshCommunity();
    } catch (err) {
      console.error('Error creating responsables team:', err);
      alert('Error al crear el equipo de responsables. Por favor, intenta de nuevo.');
    }
  };

  const handleCreateCatequistasTeam = async () => {
    if (!community?.id) return;
    
    try {
      const supabase = createClient();
      
      // Contar cuántos equipos de catequistas ya existen para numerarlos
      const existingCatequistasCount = teams.catequistas.length;
      const teamNumber = existingCatequistasCount + 1;
      
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: `Equipo de Catequistas ${teamNumber} - Comunidad ${community.number}`,
          team_type_id: 3, // Catequistas
          community_id: community.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Refrescar los datos de la comunidad
      await refreshCommunity();
    } catch (err) {
      console.error('Error creating catequistas team:', err);
      alert('Error al crear el equipo de catequistas. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteCommunity = async () => {
    if (!community?.id) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();

      // Delete in order: belongs → brothers → teams → community_step_log → community
      // 1. Get all team IDs for this community
      const { data: communityTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('community_id', community.id);
      const teamIds = communityTeams?.map(t => t.id) || [];

      if (teamIds.length > 0) {
        // 2. Delete belongs records for those teams
        const { error: belongsError } = await supabase
          .from('belongs')
          .delete()
          .in('team_id', teamIds);
        if (belongsError) throw belongsError;

        // 3. Delete parish_teams records for those teams
        const { error: parishTeamsError } = await supabase
          .from('parish_teams')
          .delete()
          .in('team_id', teamIds);
        if (parishTeamsError) throw parishTeamsError;

        // 4. Delete teams
        const { error: teamsError } = await supabase
          .from('teams')
          .delete()
          .eq('community_id', community.id);
        if (teamsError) throw teamsError;
      }

      // 5. Delete brothers
      const { error: brothersError } = await supabase
        .from('brothers')
        .delete()
        .eq('community_id', community.id);
      if (brothersError) throw brothersError;

      // 6. Delete community step logs
      const { error: logsError } = await supabase
        .from('community_step_log')
        .delete()
        .eq('community_id', community.id);
      if (logsError) throw logsError;

      // 7. Delete the community itself
      const { error: communityError, count } = await supabase
        .from('communities')
        .delete({ count: 'exact' })
        .eq('id', community.id);
      if (communityError) throw communityError;
      if (count === 0) {
        throw new Error('No se pudo eliminar la comunidad. Es posible que no tengas permisos.');
      }

      // Invalidate the communities list cache before navigating
      await queryClient.invalidateQueries({ queryKey: ['crud', 'communities'] });
      router.push(routes.comunidades);
    } catch (err: any) {
      console.error('Error deleting community:', err);
      alert(err.message || 'Error al eliminar la comunidad. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleAddBrotherToTeam = async (personIds: number[]) => {
    if (!addToTeamId) return;
    const supabase = createClient();

    for (const personId of personIds) {
      const { error } = await supabase.from('belongs').insert({
        person_id: personId,
        team_id: addToTeamId,
        community_id: communityId,
        is_responsible_for_the_team: false,
      });

      if (error) throw error;
    }

    await refreshCommunity();
  };

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Screen view - hidden when printing */}
      <div className="print:hidden">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="2"
              onClick={() => router.push(routes.comunidades)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Regresar a Comunidades
            </Button>
            <Button
              variant="outline"
              size="2"
              onClick={() => window.print()}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir Ficha
            </Button>
            {community?.parish_id && (
              <Button
                variant="outline"
                size="2"
                onClick={() => setIsMergeModalOpen(true)}
                className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <Merge className="h-4 w-4" />
                Fusionar
              </Button>
            )}
            <Button
              variant="outline"
              size="2"
              color="red"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Comunidad {community?.number || 'Cargando...'}
          </h1>
          <p className="text-gray-600 mt-2">
            {community?.parish?.name || 'Parroquia no especificada'}
          </p>
        </div>

        {/* Main Content - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Community Info + Teams */}
          <div className="space-y-6">
            <CommunityInfo community={community} loading={loading} onEdit={handleEdit} />

            {/* Responsables Team */}
            <div>
              {teams.responsables.length > 0 ? (
                teams.responsables.map((team) => (
                  <div key={team.id || `responsable-${Math.random()}`}>
                    <TeamSection
                      team={team}
                      members={team.id ? teamMembers[team.id] || [] : []}
                      parishes={team.id ? teamParishes[team.id] || [] : []}
                      loading={loading}
                      communityId={communityId}
                      onDelete={refreshCommunity}
                      onAddMember={() => setAddToTeamId(team.id!)}
                    />
                  </div>
                ))
              ) : (
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center space-y-4">
                    <p className="text-gray-500 text-lg">No hay equipo de responsables</p>
                    <p className="text-gray-400 text-sm">Crea el equipo de responsables para comenzar</p>
                    <Button
                      onClick={handleCreateResponsablesTeam}
                      className="flex items-center gap-2"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                      Crear Equipo de Responsables
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Catequistas Teams */}
            <div className="space-y-4">
              {teams.catequistas.length > 0 ? (
                <>
                  {teams.catequistas.map((team, index) => (
                    <div key={team.id || `catequista-${index}`}>
                      <TeamSection
                        team={team}
                        members={team.id ? teamMembers[team.id] || [] : []}
                        parishes={team.id ? teamParishes[team.id] || [] : []}
                        loading={loading}
                        teamNumber={index + 1}
                        communityId={communityId}
                        onDelete={refreshCommunity}
                        onAddMember={() => setAddToTeamId(team.id!)}
                      />
                    </div>
                  ))}
                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={handleCreateCatequistasTeam}
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Equipo de Catequistas
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center space-y-4">
                    <p className="text-gray-500 text-lg">No hay equipos de catequistas</p>
                    <p className="text-gray-400 text-sm">Crea el primer equipo de catequistas para comenzar</p>
                    <Button
                      onClick={handleCreateCatequistasTeam}
                      className="flex items-center gap-2"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                      Crear Equipo de Catequistas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Step Log + Brothers List (unified) */}
          <div className="space-y-6">
            <CommunityStepLogCompact
              communityId={communityId}
              communityNumber={community?.number || ''}
              onStepLogAdded={refreshCommunity}
              defaultCatechistName={defaultCatechistName}
              actualBrothers={community?.actual_brothers}
            />

            <BrothersList
              brothers={mergedBrothers}
              loading={loading}
              communityId={communityId}
              teamMembers={teamMembers}
              onDelete={refreshCommunity}
              onAdd={refreshCommunity}
            />
          </div>
        </div>
      </div>

      {/* Print view - only visible when printing */}
      <CommunityPrintView
        community={community}
        teams={teams}
        teamMembers={teamMembers}
        teamParishes={teamParishes}
        stepLogs={stepLogs}
        parishPriestName={parishPriestName}
        mergedBrothers={mergedBrothers}
      />

      {/* Modal de edición */}
      <DynamicEntityModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        initial={community}
        fields={communityConfig.fields}
        title="Editar Comunidad"
        loading={isSaving}
      />

      {/* Modal para agregar hermano a equipo */}
      <SelectBrotherForTeamModal
        open={addToTeamId !== null}
        onClose={() => setAddToTeamId(null)}
        onSelect={handleAddBrotherToTeam}
        brothers={mergedBrothers}
        teamMembers={addToTeamId ? teamMembers[addToTeamId] || [] : []}
      />

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCommunity}
        title="¿Eliminar comunidad?"
        description={`¿Estás seguro de que deseas eliminar la Comunidad ${community?.number || ''}? Se eliminarán todos los datos asociados.`}
        preview={[
          `${mergedBrothers.length} hermano(s)`,
          `${teams.responsables.length + teams.catequistas.length} equipo(s)`,
          `${stepLogs.length} registro(s) de bitácora`,
        ]}
        loading={isDeleting}
      />

      {/* Modal de fusión de comunidades */}
      {community?.parish_id && (
        <MergeCommunityModal
          open={isMergeModalOpen}
          onClose={() => setIsMergeModalOpen(false)}
          keepCommunityId={communityId}
          keepCommunityNumber={community.number || ''}
          parishId={community.parish_id}
          onSuccess={refreshCommunity}
        />
      )}
    </div>
  );
}
