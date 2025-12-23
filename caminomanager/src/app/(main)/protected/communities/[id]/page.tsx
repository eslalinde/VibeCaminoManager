'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCommunityData } from '@/hooks/useCommunityData';
import { CommunityInfo } from '@/components/crud/CommunityInfo';
import { BrothersList } from '@/components/crud/BrothersList';
import { TeamSection } from '@/components/crud/TeamSection';
import { CommunityStepLogCompact } from '@/components/crud/CommunityStepLogCompact';
import { DynamicEntityModal } from '@/components/crud/DynamicEntityModal';
import { communityConfig } from '@/config/entities';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Community } from '@/types/database';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = parseInt(params.id as string);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    community,
    mergedBrothers,
    teams,
    teamMembers,
    teamParishes,
    loading,
    error,
    refreshCommunity
  } = useCommunityData(communityId);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = async (data: Omit<Community, 'id' | 'created_at' | 'updated_at'>) => {
    if (!community?.id) return;
    
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('communities')
        .update(data)
        .eq('id', community.id);

      if (updateError) throw updateError;

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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="2"
            onClick={() => router.push('/protected/communities')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar a Comunidades
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Comunidad {community?.number || 'Cargando...'}
        </h1>
        <p className="text-gray-600 mt-2">
          {community?.parish?.name || 'Parroquia no especificada'}
        </p>
      </div>

      {/* Main Content - 50/50 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Community Info + Teams */}
        <div className="space-y-6">
          {/* Community Info */}
          <div>
            <CommunityInfo community={community} loading={loading} onEdit={handleEdit} />
          </div>

          {/* Responsables Team */}
          <div className="h-80">
            {teams.responsables.length > 0 ? (
              teams.responsables.map((team) => (
                <TeamSection
                  key={team.id || `responsable-${Math.random()}`}
                  team={team}
                  members={team.id ? teamMembers[team.id] || [] : []}
                  parishes={team.id ? teamParishes[team.id] || [] : []}
                  loading={loading}
                  communityId={communityId}
                  onDelete={refreshCommunity}
                />
              ))
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
        
        {/* Right: Step Log + Brothers List */}
        <div className="space-y-4">
          {/* Step Log */}
          <div>
            <CommunityStepLogCompact 
              communityId={communityId} 
              communityNumber={community?.number || ''} 
            />
          </div>
          
          {/* Brothers List */}
          <div className="flex-1">
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
    </div>
  );
}
