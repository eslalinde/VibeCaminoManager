import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { BaseEntity } from '@/types/database';
import { queryKeys } from '@/lib/queryKeys';

interface UseEntityOptionsOptions {
  tableName: string;
  valueField?: string;
  labelField?: string;
  filters?: Record<string, any>;
  orderBy?: { field: string; asc: boolean };
}

export function useEntityOptions<T extends BaseEntity>({
  tableName,
  valueField = 'id',
  labelField = 'name',
  filters = {},
  orderBy = { field: 'name', asc: true }
}: UseEntityOptionsOptions) {
  const supabase = useMemo(() => createClient(), []);

  const query = useQuery({
    queryKey: queryKeys.options.filtered(tableName, { filters, orderBy }),
    queryFn: async () => {
      let q = supabase.from(tableName).select('*');

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'object' && value.not !== undefined) {
            q = q.neq(key, value.not);
          } else {
            q = q.eq(key, value);
          }
        }
      });

      // Apply ordering
      q = q.order(orderBy.field, { ascending: orderBy.asc });

      const { data, error } = await q;

      if (error) throw error;

      return (data || []).map(item => ({
        value: item[valueField] as string | number,
        label: item[labelField] as string,
      }));
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  return {
    options: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// Hook específico para países
export function useCountryOptions() {
  return useEntityOptions({
    tableName: 'countries',
    orderBy: { field: 'name', asc: true }
  });
}

// Hook específico para departamentos
export function useStateOptions(countryId?: number) {
  return useEntityOptions({
    tableName: 'states',
    filters: countryId ? { country_id: countryId } : {},
    orderBy: { field: 'name', asc: true }
  });
}

// Hook específico para ciudades
export function useCityOptions(countryId?: number, stateId?: number) {
  const filters: Record<string, any> = {};
  if (countryId) filters.country_id = countryId;
  if (stateId) filters.state_id = stateId;

  return useEntityOptions({
    tableName: 'cities',
    filters,
    orderBy: { field: 'name', asc: true }
  });
}

// Hook específico para zonas por ciudad
export function useZoneOptions(cityId?: number) {
  return useEntityOptions({
    tableName: 'city_zones',
    filters: cityId ? { city_id: cityId } : {},
    orderBy: { field: 'name', asc: true }
  });
}

// Hook específico para todas las ciudades (sin filtros)
export function useAllCityOptions() {
  return useEntityOptions({
    tableName: 'cities',
    orderBy: { field: 'name', asc: true }
  });
}

// Hook específico para diócesis
export function useDioceseOptions() {
  return useEntityOptions({
    tableName: 'dioceses',
    orderBy: { field: 'name', asc: true }
  });
}

// Hook específico para parroquias
export function useParishOptions(cityId?: number) {
  return useEntityOptions({
    tableName: 'parishes',
    filters: cityId ? { city_id: cityId } : {},
    orderBy: { field: 'name', asc: true }
  });
}

// Hook específico para todas las parroquias (sin filtros)
export function useAllParishOptions() {
  return useEntityOptions({
    tableName: 'parishes',
    orderBy: { field: 'name', asc: true }
  });
}

// Hook específico para equipos de catequistas (con responsables y parroquias en una sola query)
export function useCathechistTeamOptions() {
  const supabase = useMemo(() => createClient(), []);

  const query = useQuery({
    queryKey: queryKeys.options.catechistTeams(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          belongs(
            is_responsible_for_the_team,
            person:people(person_name)
          ),
          parish_teams(
            parish:parishes(name)
          )
        `)
        .eq('team_type_id', 3)
        .eq('belongs.is_responsible_for_the_team', true)
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []).map((team: any) => {
        const responsibles = (team.belongs || [])
          .map((b: any) => b.person?.person_name)
          .filter(Boolean);

        const parishes = (team.parish_teams || [])
          .map((pt: any) => pt.parish?.name)
          .filter(Boolean);

        const parts: string[] = [];
        if (responsibles.length > 0) parts.push(responsibles.join(', '));
        if (parishes.length > 0) parts.push(parishes.join(', '));

        const label = parts.length > 0 ? parts.join(' - ') : team.name;

        return { value: team.id as number, label };
      });
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  return {
    options: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// Hook específico para personas (para cónyuges)
export function usePeopleOptions(excludeId?: number) {
  const filters: Record<string, any> = {};
  if (excludeId) {
    filters.id = { not: excludeId };
  }

  return useEntityOptions({
    tableName: 'people',
    valueField: 'id',
    labelField: 'person_name',
    filters,
    orderBy: { field: 'person_name', asc: true }
  });
}
