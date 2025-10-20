import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BaseEntity } from '@/types/database';

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
  const [options, setOptions] = useState<{ value: string | number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching options for table: ${tableName}`);
      let query = supabase.from(tableName).select('*');
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'object' && value.not !== undefined) {
            // Handle "not" filters
            query = query.neq(key, value.not);
          } else {
            query = query.eq(key, value);
          }
        }
      });
      
      // Apply ordering
      query = query.order(orderBy.field, { ascending: orderBy.asc });
      
      const { data, error: queryError } = await query;
      
      if (queryError) {
        console.error(`Query error for ${tableName}:`, queryError);
        throw queryError;
      }
      
      console.log(`Raw data for ${tableName}:`, data);
      
      const formattedOptions = (data || []).map(item => ({
        value: item[valueField],
        label: item[labelField]
      }));
      
      console.log(`Formatted options for ${tableName}:`, formattedOptions);
      setOptions(formattedOptions);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las opciones');
      console.error('Error fetching options:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [tableName, JSON.stringify(filters), JSON.stringify(orderBy)]);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions
  };
}

// Hook específico para países
export function useCountryOptions() {
  return useEntityOptions({
    tableName: 'countries',
    orderBy: { field: 'name', asc: true }
  });
}

// Hook específico para estados
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

// Hook específico para todas las ciudades (sin filtros)
export function useAllCityOptions() {
  return useEntityOptions({
    tableName: 'cities',
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

// Hook específico para personas (para cónyuges)
export function usePeopleOptions(excludeId?: number) {
  const filters: Record<string, any> = {};
  if (excludeId) {
    // Exclude the current person from spouse options
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