import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { AuditLog } from '@/types/database';
import { queryKeys } from '@/lib/queryKeys';

export interface AuditFilters {
  table?: string;
  operation?: string;
}

const PAGE_SIZE = 20;

// Tables where person_id is meaningful
const PERSON_TABLES = new Set(['brothers', 'belongs']);

function collectPersonIds(entries: AuditLog[]): number[] {
  const ids = new Set<number>();
  for (const entry of entries) {
    if (!PERSON_TABLES.has(entry.table_name)) continue;
    const newPid = entry.new_values?.person_id;
    const oldPid = entry.old_values?.person_id;
    if (typeof newPid === 'number') ids.add(newPid);
    if (typeof oldPid === 'number') ids.add(oldPid);
  }
  return Array.from(ids);
}

function collectTeamIds(entries: AuditLog[]): number[] {
  const ids = new Set<number>();
  for (const entry of entries) {
    if (entry.table_name !== 'belongs') continue;
    const newTid = entry.new_values?.team_id;
    const oldTid = entry.old_values?.team_id;
    if (typeof newTid === 'number') ids.add(newTid);
    if (typeof oldTid === 'number') ids.add(oldTid);
  }
  return Array.from(ids);
}

export function useAuditLog(communityId: number, enabled: boolean = true) {
  const supabase = useMemo(() => createClient(), []);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [page, setPage] = useState(0);

  const queryKey = queryKeys.audit.community(communityId, {
    ...filters,
    page,
  });

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('audit_log')
        .select(
          '*, user_profile:profiles!audit_log_user_id_profiles_fkey(full_name)',
          { count: 'exact' }
        )
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .range(0, (page + 1) * PAGE_SIZE - 1);

      if (filters.table) {
        query = query.eq('table_name', filters.table);
      }
      if (filters.operation) {
        query = query.eq('operation', filters.operation);
      }

      const { data: rows, error, count } = await query;
      if (error) throw error;

      const entries = (rows || []) as AuditLog[];

      // Resolve person names referenced in audit entries
      const personIds = collectPersonIds(entries);
      let personNames: Record<number, string> = {};

      if (personIds.length > 0) {
        const { data: people } = await supabase
          .from('people')
          .select('id, person_name')
          .in('id', personIds);

        if (people) {
          personNames = Object.fromEntries(
            people.map((p: { id: number; person_name: string }) => [p.id, p.person_name])
          );
        }
      }

      // Resolve team names for belongs entries
      const teamIds = collectTeamIds(entries);
      let teamNames: Record<number, string> = {};

      if (teamIds.length > 0) {
        const { data: teams } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', teamIds);

        if (teams) {
          teamNames = Object.fromEntries(
            teams.map((t: { id: number; name: string }) => [t.id, t.name])
          );
        }
      }

      return { entries, totalCount: count || 0, personNames, teamNames };
    },
    enabled: enabled && !!communityId,
    staleTime: 30_000,
  });

  const entries = data?.entries ?? [];
  const totalCount = data?.totalCount ?? 0;
  const personNames = data?.personNames ?? {};
  const teamNames = data?.teamNames ?? {};
  const hasMore = entries.length < totalCount;

  const loadMore = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const updateFilters = useCallback((newFilters: AuditFilters) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  return {
    entries,
    totalCount,
    hasMore,
    isLoading,
    error: error?.message ?? null,
    filters,
    updateFilters,
    loadMore,
    personNames,
    teamNames,
  };
}
