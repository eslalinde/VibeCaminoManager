import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Parish, Priest, Community } from '@/types/database';

export interface ParishData {
  parish: Parish | null;
  priests: Priest[];
  communities: Community[];
  loading: boolean;
  error: string | null;
}

export function useParishData(parishId: number): ParishData & {
  refreshParish: () => Promise<void>;
} {
  const [parish, setParish] = useState<Parish | null>(null);
  const [priests, setPriests] = useState<Priest[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchParishData = useCallback(async () => {
    if (!parishId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch parish with relations
      const { data: parishData, error: parishError } = await supabase
        .from('parishes')
        .select(`
          *,
          diocese:dioceses(*),
          city:cities(*, state:states(*), country:countries(*)),
          zone:city_zones(*)
        `)
        .eq('id', parishId)
        .single();

      if (parishError) throw parishError;

      // Fetch priests with person data
      const { data: priestsData, error: priestsError } = await supabase
        .from('priests')
        .select(`
          *,
          person:people(*)
        `)
        .eq('parish_id', parishId);

      if (priestsError) throw priestsError;

      // Fetch communities of this parish
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select(`
          *,
          step_way:step_ways(*)
        `)
        .eq('parish_id', parishId)
        .order('number', { ascending: true });

      if (communitiesError) throw communitiesError;

      setParish(parishData);
      setPriests(priestsData || []);
      setCommunities(communitiesData || []);
    } catch (err) {
      console.error('Error fetching parish data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [parishId, supabase]);

  useEffect(() => {
    fetchParishData();
  }, [fetchParishData]);

  const refreshParish = useCallback(async () => {
    await fetchParishData();
  }, [fetchParishData]);

  return {
    parish,
    priests,
    communities,
    loading,
    error,
    refreshParish,
  };
}
