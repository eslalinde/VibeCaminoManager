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
      
      // Apply filters
      const filters = params?.filters;
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      // Apply search
      const searchTerm = params?.search || search;
      if (searchTerm && searchFields.length > 0) {
        // Separate regular fields from foreign key fields
        const regularFields: string[] = [];
        const foreignKeySearches: { foreignKey: string; displayField: string; tableName: string }[] = [];
        
        searchFields.forEach(field => {
          const fieldStr = String(field);
          const foreignKeyConfig = foreignKeys.find(fk => fk.alias === fieldStr);
          
          if (foreignKeyConfig) {
            foreignKeySearches.push({
              foreignKey: foreignKeyConfig.foreignKey,
              displayField: foreignKeyConfig.displayField,
              tableName: foreignKeyConfig.tableName
            });
          } else {
            regularFields.push(fieldStr);
          }
        });
        
        // Handle foreign key searches by querying related tables first
        if (foreignKeySearches.length > 0) {
          try {
            // Search in related tables to get matching IDs
            const foreignKeyIds: number[] = [];
            
            for (const fkSearch of foreignKeySearches) {
              const { data: relatedData } = await supabase
                .from(fkSearch.tableName)
                .select('id')
                .ilike(fkSearch.displayField, `%${searchTerm}%`);
              
              if (relatedData) {
                foreignKeyIds.push(...relatedData.map(item => item.id));
              }
            }
            
            // If we found matching foreign key IDs, add them to the query
            if (foreignKeyIds.length > 0) {
              // Create conditions for foreign key searches
              const foreignKeyConditions: string[] = [];
              foreignKeySearches.forEach(fkSearch => {
                foreignKeyConditions.push(`${fkSearch.foreignKey}.in.(${foreignKeyIds.join(',')})`);
              });
              
              // Combine with regular field conditions
              const allConditions: string[] = [];
              
              if (regularFields.length > 0) {
                const regularConditions = regularFields.map(field => 
                  `${field}.ilike.%${searchTerm}%`
                );
                allConditions.push(...regularConditions);
              }
              
              allConditions.push(...foreignKeyConditions);
              
              if (allConditions.length > 0) {
                query = query.or(allConditions.join(','));
              }
            } else if (regularFields.length > 0) {
              // If no foreign key matches, only search regular fields
              const regularConditions = regularFields.map(field => 
                `${field}.ilike.%${searchTerm}%`
              );
              query = query.or(regularConditions.join(','));
            }
          } catch (error) {
            console.error('Error searching foreign key fields:', error);
            // Fallback to regular field search only
            if (regularFields.length > 0) {
              const regularConditions = regularFields.map(field => 
                `${field}.ilike.%${searchTerm}%`
              );
              query = query.or(regularConditions.join(','));
            }
          }
        } else if (regularFields.length > 0) {
          // Only regular fields to search
          const regularConditions = regularFields.map(field => 
            `${field}.ilike.%${searchTerm}%`
          );
          query = query.or(regularConditions.join(','));
        }
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
  }, [supabase, tableName, searchFields, pageSize, foreignKeys, search, sort, page]);

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
      return 'Ya existe un departamento con ese nombre en el país seleccionado.';
    } else if (constraintName.includes('cities_name_country_state_unique')) {
      return 'Ya existe una ciudad con ese nombre en el país y departamento seleccionados.';
    } else if (constraintName.includes('parishes_name_city_unique')) {
      return 'Ya existe una parroquia con ese nombre en la ciudad seleccionada.';
    } else if (constraintName.includes('team_types_name_unique')) {
      return 'Ya existe un tipo de equipo con ese nombre.';
    } else if (constraintName.includes('step_ways_name_unique')) {
      return 'Ya existe una etapa con ese nombre.';
    } else if (constraintName.includes('communities_number_parish_unique')) {
      return 'Ya existe una comunidad con ese número en la parroquia seleccionada.';
    } else if (detail.includes('name') && detail.includes('country_id') && detail.includes('state_id')) {
      return 'Ya existe una ciudad con ese nombre en el país y departamento seleccionados.';
    } else if (detail.includes('name') && detail.includes('country_id')) {
      return 'Ya existe un departamento con ese nombre en el país seleccionado.';
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