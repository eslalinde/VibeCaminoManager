import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Team, Belongs, Community } from '@/types/database';

export interface NationalTeamData {
  team: Team | null;
  members: Belongs[];
  communities: Community[];
  loading: boolean;
  error: string | null;
  refreshTeam: () => Promise<void>;
}

export function useNationalTeamData(): NationalTeamData {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Belongs[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Find the national team (community_id IS NULL, team_type_id = 3)
      // The team is created by a database migration, so it should always exist
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*, team_type:team_types(*)')
        .is('community_id', null)
        .eq('team_type_id', 3)
        .maybeSingle();

      if (teamError) throw teamError;

      if (!teamData) {
        throw new Error('El equipo nacional de catequistas no existe. Contacta al administrador.');
      }

      setTeam(teamData);

      if (!teamData?.id) return;

      // Fetch members (via belongs)
      const { data: membersData, error: membersError } = await supabase
        .from('belongs')
        .select('*, person:people(*)')
        .eq('team_id', teamData.id);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Fetch communities where this team is the catechist team
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select('*, parish:parishes(*), step_way:step_ways(*)')
        .eq('cathechist_team_id', teamData.id);

      if (communitiesError) throw communitiesError;
      setCommunities(communitiesData || []);
    } catch (err: any) {
      console.error('Error fetching national team data:', JSON.stringify(err));
      setError(err?.message || (typeof err === 'string' ? err : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshTeam = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    team,
    members,
    communities,
    loading,
    error,
    refreshTeam,
  };
}
