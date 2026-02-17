import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { Parish, Priest, Community } from '@/types/database';
import { queryKeys } from '@/lib/queryKeys';
import { SupabaseClient } from '@supabase/supabase-js';

export interface ParishData {
  parish: Parish | null;
  priests: Priest[];
  communities: Community[];
  loading: boolean;
  error: string | null;
}

// --- Fetcher functions ---

async function fetchParish(supabase: SupabaseClient, parishId: number) {
  const { data, error } = await supabase
    .from('parishes')
    .select(`
      *,
      diocese:dioceses(*),
      city:cities(*, state:states(*), country:countries(*)),
      zone:city_zones(*)
    `)
    .eq('id', parishId)
    .single();

  if (error) throw error;
  return data as Parish;
}

async function fetchPriests(supabase: SupabaseClient, parishId: number) {
  const { data, error } = await supabase
    .from('priests')
    .select(`
      *,
      person:people(*)
    `)
    .eq('parish_id', parishId);

  if (error) throw error;
  return (data || []) as Priest[];
}

async function fetchParishCommunities(supabase: SupabaseClient, parishId: number) {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      step_way:step_ways(*)
    `)
    .eq('parish_id', parishId)
    .order('number', { ascending: true });

  if (error) throw error;
  return (data || []) as Community[];
}

// --- Hook ---

export function useParishData(parishId: number): ParishData & {
  refreshParish: () => Promise<void>;
  invalidateDetail: () => Promise<void>;
  invalidatePriests: () => Promise<void>;
  invalidateCommunities: () => Promise<void>;
} {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const parishQuery = useQuery({
    queryKey: queryKeys.parish.detail(parishId),
    queryFn: () => fetchParish(supabase, parishId),
    enabled: !!parishId,
  });

  const priestsQuery = useQuery({
    queryKey: queryKeys.parish.priests(parishId),
    queryFn: () => fetchPriests(supabase, parishId),
    enabled: !!parishId,
  });

  const communitiesQuery = useQuery({
    queryKey: queryKeys.parish.communities(parishId),
    queryFn: () => fetchParishCommunities(supabase, parishId),
    enabled: !!parishId,
  });

  // Invalidation helpers
  const invalidateDetail = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.parish.detail(parishId) }),
    [queryClient, parishId]
  );

  const invalidatePriests = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.parish.priests(parishId) }),
    [queryClient, parishId]
  );

  const invalidateCommunities = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.parish.communities(parishId) }),
    [queryClient, parishId]
  );

  const refreshParish = useCallback(
    async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.parish.all });
    },
    [queryClient]
  );

  // Combine loading/error state
  const loading = parishQuery.isLoading || priestsQuery.isLoading || communitiesQuery.isLoading;
  const error = parishQuery.error?.message
    ?? priestsQuery.error?.message
    ?? communitiesQuery.error?.message
    ?? null;

  return {
    parish: parishQuery.data ?? null,
    priests: priestsQuery.data ?? [],
    communities: communitiesQuery.data ?? [],
    loading,
    error,
    refreshParish,
    invalidateDetail,
    invalidatePriests,
    invalidateCommunities,
  };
}
