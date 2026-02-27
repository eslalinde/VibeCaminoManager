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

      return {
        entries: (rows || []) as AuditLog[],
        totalCount: count || 0,
      };
    },
    enabled: enabled && !!communityId,
    staleTime: 30_000,
  });

  const entries = data?.entries ?? [];
  const totalCount = data?.totalCount ?? 0;
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
  };
}
