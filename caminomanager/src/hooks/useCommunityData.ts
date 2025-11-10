import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Community, Brother, Team, Belongs, Person, Parish } from '@/types/database';

export interface CommunityData {
  community: Community | null;
  brothers: Brother[];
  teams: {
    responsables: Team[];
    catequistas: Team[];
  };
  teamMembers: Record<number, Belongs[]>;
  teamParishes: Record<number, Parish[]>;
  loading: boolean;
  error: string | null;
}

export interface MergedBrother {
  id: string;
  name: string;
  carisma: string;
  celular: string;
  isMarriage: boolean;
  personIds: number[];
}

export function useCommunityData(communityId: number): CommunityData & {
  mergedBrothers: MergedBrother[];
} {
  const [community, setCommunity] = useState<Community | null>(null);
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<number, Belongs[]>>({});
  const [teamParishes, setTeamParishes] = useState<Record<number, Parish[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!communityId) return;
    
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch community with relations
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select(`
            *,
            parish:parishes(*),
            step_way:step_ways(*)
          `)
          .eq('id', communityId)
          .single();

        if (communityError) throw communityError;

        // Fetch brothers with person data
        const { data: brothersData, error: brothersError } = await supabase
          .from('brothers')
          .select(`
            *,
            person:people(*)
          `)
          .eq('community_id', communityId);

        if (brothersError) throw brothersError;

        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select(`
            *,
            team_type:team_types(*)
          `)
          .eq('community_id', communityId);

        if (teamsError) throw teamsError;

        // Fetch team members for all teams
        const teamIds = teamsData?.map(team => team.id) || [];
        let membersData: Belongs[] = [];
        
        if (teamIds.length > 0) {
          const { data: members, error: membersError } = await supabase
            .from('belongs')
            .select(`
              *,
              person:people(*)
            `)
            .in('team_id', teamIds);

          if (membersError) throw membersError;
          membersData = members || [];
        }

        // Group team members by team_id
        const membersByTeam: Record<number, Belongs[]> = {};
        membersData.forEach(member => {
          if (!membersByTeam[member.team_id]) {
            membersByTeam[member.team_id] = [];
          }
          membersByTeam[member.team_id].push(member);
        });

        // Fetch parishes for each team
        const parishesByTeam: Record<number, Parish[]> = {};
        
        if (teamIds.length > 0) {
          const { data: parishTeamsData, error: parishTeamsError } = await supabase
            .from('parish_teams')
            .select(`
              team_id,
              parish:parishes(*)
            `)
            .in('team_id', teamIds);

          if (parishTeamsError) throw parishTeamsError;

          // Group parishes by team_id
          parishTeamsData?.forEach(item => {
            if (!parishesByTeam[item.team_id]) {
              parishesByTeam[item.team_id] = [];
            }
            if (item.parish) {
              parishesByTeam[item.team_id].push(item.parish as unknown as Parish);
            }
          });
        }

        setCommunity(communityData);
        setBrothers(brothersData || []);
        setTeams(teamsData || []);
        setTeamMembers(membersByTeam);
        setTeamParishes(parishesByTeam);

      } catch (err) {
        console.error('Error fetching community data:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [communityId, supabase]);

  // Group teams by type
  const groupedTeams = useMemo(() => {
    const responsables = teams.filter(team => team.team_type_id === 4);
    const catequistas = teams.filter(team => team.team_type_id === 3);
    
    return {
      responsables,
      catequistas
    };
  }, [teams]);

  // Merge married couples
  const mergedBrothers = useMemo(() => {
    const processedIds = new Set<number>();
    const merged: MergedBrother[] = [];

    const carismaOptions = [
      { value: 1, label: 'Casado' },
      { value: 2, label: 'Soltero' },
      { value: 3, label: 'Presbítero' },
      { value: 4, label: 'Seminarista' },
      { value: 5, label: 'Diácono' },
      { value: 6, label: 'Monja' },
      { value: 7, label: 'Viudo' }
    ];

    // Person types that cannot be married (should not be merged with spouse)
    const nonMarriageTypes = [3, 4, 5, 6]; // Presbítero, Seminarista, Diácono, Monja

    brothers.forEach(brother => {
      if (processedIds.has(brother.person_id)) return;

      const person = brother.person;
      if (!person) return;

      // Check person_type_id first - if it's a type that cannot be married, skip marriage logic
      const cannotBeMarried = person.person_type_id && nonMarriageTypes.includes(person.person_type_id);

      // Check if this person is married and spouse is also in the community
      // Only check for marriage if the person type allows it
      if (!cannotBeMarried && person.spouse_id) {
        const spouseBrother = brothers.find(b => 
          b.person_id === person.spouse_id && 
          !processedIds.has(b.person_id)
        );

        if (spouseBrother && spouseBrother.person) {
          // Verify spouse is also not a non-marriage type
          const spouseCannotBeMarried = spouseBrother.person.person_type_id && 
            nonMarriageTypes.includes(spouseBrother.person.person_type_id);
          
          if (!spouseCannotBeMarried) {
            // Create merged marriage entry
            const husband = person.gender_id === 1 ? person : spouseBrother.person;
            const wife = person.gender_id === 2 ? person : spouseBrother.person;
            
            merged.push({
              id: `marriage-${person.id}-${spouseBrother.person_id}`,
              name: `${husband.person_name} y ${wife.person_name}`,
              carisma: 'Casado',
              celular: husband.mobile || wife.mobile || '',
              isMarriage: true,
              personIds: [person.id!, spouseBrother.person_id]
            });

            processedIds.add(person.id!);
            processedIds.add(spouseBrother.person_id);
            return;
          }
        }
      }

      // Single person (or person type that cannot be married)
      const carisma = carismaOptions.find(opt => opt.value === person.person_type_id)?.label || '';

      merged.push({
        id: `person-${person.id}`,
        name: person.person_name,
        carisma,
        celular: person.mobile || '',
        isMarriage: false,
        personIds: [person.id!]
      });

      processedIds.add(person.id!);
    });

    return merged;
  }, [brothers]);

  return {
    community,
    brothers,
    teams: groupedTeams,
    teamMembers,
    teamParishes,
    loading,
    error,
    mergedBrothers
  };
}
