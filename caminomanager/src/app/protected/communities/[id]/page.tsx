'use client';

import { useParams } from 'next/navigation';
import { useCommunityData } from '@/hooks/useCommunityData';
import { CommunityInfo } from '@/components/crud/CommunityInfo';
import { BrothersList } from '@/components/crud/BrothersList';
import { TeamSection } from '@/components/crud/TeamSection';

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = parseInt(params.id as string);
  
  const {
    community,
    mergedBrothers,
    teams,
    teamMembers,
    loading,
    error
  } = useCommunityData(communityId);

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
            <CommunityInfo community={community} loading={loading} />
          </div>

          {/* Responsables Team */}
          <div className="h-80">
            {teams.responsables.length > 0 ? (
              teams.responsables.map((team) => (
                <TeamSection
                  key={team.id}
                  team={team}
                  members={teamMembers[team.id] || []}
                  loading={loading}
                />
              ))
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No hay equipo de responsables</p>
                  <p className="text-gray-400 text-sm">Los responsables aún no han sido asignados</p>
                </div>
              </div>
            )}
          </div>

          {/* Catequistas Teams */}
          <div className="space-y-4">
            {teams.catequistas.length > 0 ? (
              teams.catequistas.map((team, index) => (
                <div key={team.id}>
                  <TeamSection
                    team={team}
                    members={teamMembers[team.id] || []}
                    loading={loading}
                    teamNumber={index + 1}
                  />
                </div>
              ))
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No hay equipos de catequistas</p>
                  <p className="text-gray-400 text-sm">Los equipos de catequistas aún no han sido creados</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right: Brothers List - Full Height */}
        <div className="h-full">
          <BrothersList brothers={mergedBrothers} loading={loading} />
        </div>
      </div>
    </div>
  );
}
