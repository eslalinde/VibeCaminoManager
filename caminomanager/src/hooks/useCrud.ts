import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CrudOperation, QueryParams, BaseEntity } from '@/types/database';

export interface ForeignKeyRelation {
  foreignKey: string;
  tableName: string;
  displayField: string;
  alias?: string;
}

export interface UseCrudOptions<T extends BaseEntity> {
  tableName: string;
  searchFields?: (keyof T)[];
  defaultSort?: { field: keyof T; asc: boolean };
  pageSize?: number;
  foreignKeys?: ForeignKeyRelation[];
}

export interface UseCrudReturn<T extends BaseEntity> {
  data: T[];
  loading: boolean;
  error: string | null;
  count: number;
  page: number;
  totalPages: number;
  search: string;
  sort: { field: keyof T; asc: boolean };
  
  // Actions
  fetchData: (params?: QueryParams) => Promise<void>;
  create: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<void>;
  
  // UI state
  setSearch: (search: string) => void;
  setSort: (sort: { field: keyof T; asc: boolean }) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

export function useCrud<T extends BaseEntity>({
  tableName,
  searchFields = [],
  defaultSort = { field: 'id' as keyof T, asc: true },
  pageSize = 10,
  foreignKeys = []
}: UseCrudOptions<T>): UseCrudReturn<T> {
  const supabase = useMemo(() => createClient(), []);
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ field: keyof T; asc: boolean }>(defaultSort);

  const totalPages = Math.ceil(count / pageSize);

  const clearError = useCallback(() => setError(null), []);

  const fetchData = useCallback(async (params?: QueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build select statement with foreign key joins
      let selectFields = '*';
      if (foreignKeys.length > 0) {
        const foreignKeySelects = foreignKeys.map(fk => {
          const alias = fk.alias || fk.tableName;
          return `${alias}:${fk.foreignKey}(${fk.displayField})`;
        });
        selectFields = `*, ${foreignKeySelects.join(', ')}`;
      }
      
      let query = supabase.from(tableName).select(selectFields, { count: 'exact' });
      
      // Apply search
      const searchTerm = params?.search || search;
      if (searchTerm && searchFields.length > 0) {
        const searchConditions = searchFields.map(field => 
          `${String(field)}.ilike.%${searchTerm}%`
        );
        query = query.or(searchConditions.join(','));
      }
      
      // Apply sorting
      const sortConfig = params?.sort || sort;
      query = query.order(sortConfig.field as string, { ascending: sortConfig.asc });
      
      // Apply pagination
      const currentPage = params?.page || page;
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data: result, error: queryError, count: totalCount } = await query;
      
      if (queryError) throw queryError;
      
      setData((result as unknown as T[]) || []);
      setCount(totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, tableName, searchFields, pageSize, foreignKeys]);

  const create = useCallback(async (newData: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([newData])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchData();
      return result;
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase, tableName, fetchData]);


  const update = useCallback(async (id: number, updateData: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchData();
      return result;
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase, tableName, fetchData]);

  const deleteItem = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchData();
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase, tableName, fetchData]);

  return {
    data,
    loading,
    error,
    count,
    page,
    totalPages,
    search,
    sort,
    fetchData,
    create,
    update,
    delete: deleteItem,
    setSearch,
    setSort,
    setPage,
    clearError
  };
}

// Función helper para manejar errores específicos de Supabase
function handleSupabaseError(error: any): string {
  if (error.code === '23505') {
    // Unique constraint violation
    const constraintName = error.constraint || '';
    const detail = error.detail || '';
    
    // Handle specific constraint violations based on constraint names
    if (constraintName.includes('countries_name_unique')) {
      return 'Ya existe un país con ese nombre.';
    } else if (constraintName.includes('states_name_country_unique')) {
      return 'Ya existe un estado con ese nombre en el país seleccionado.';
    } else if (constraintName.includes('cities_name_country_state_unique')) {
      return 'Ya existe una ciudad con ese nombre en el país y estado seleccionados.';
    } else if (constraintName.includes('parishes_name_city_unique')) {
      return 'Ya existe una parroquia con ese nombre en la ciudad seleccionada.';
    } else if (constraintName.includes('team_types_name_unique')) {
      return 'Ya existe un tipo de equipo con ese nombre.';
    } else if (constraintName.includes('step_ways_name_unique')) {
      return 'Ya existe un camino con ese nombre.';
    } else if (constraintName.includes('communities_number_parish_unique')) {
      return 'Ya existe una comunidad con ese número en la parroquia seleccionada.';
    } else if (detail.includes('name') && detail.includes('country_id') && detail.includes('state_id')) {
      return 'Ya existe una ciudad con ese nombre en el país y estado seleccionados.';
    } else if (detail.includes('name') && detail.includes('country_id')) {
      return 'Ya existe un estado con ese nombre en el país seleccionado.';
    } else if (detail.includes('name')) {
      return 'Ya existe un registro con ese nombre.';
    } else {
      return 'Ya existe un registro con esos datos.';
    }
  } else if (error.code === '23503') {
    return 'No se puede eliminar este registro porque está siendo usado por otros datos.';
  } else if (error.code === '23514') {
    return 'Los datos no cumplen con las restricciones de validación.';
  } else if (error.code === '42P01') {
    return 'La tabla no existe.';
  } else if (error.code === '42501') {
    return 'No tienes permisos para realizar esta operación.';
  } else if (error.code === '409') {
    return 'Conflicto: Los datos enviados ya existen o violan alguna restricción.';
  } else {
    return error.message || 'Error inesperado. Por favor, inténtalo de nuevo.';
  }
} 