'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EntityTable } from './EntityTable';
import { EntityModal } from './EntityModal';
import { DynamicEntityModal } from './DynamicEntityModal';
import { useCrud } from '@/hooks/useCrud';
import { BaseEntity, FormField, EntityConfig } from '@/types/database';
import { Search, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface EntityPageProps<T extends BaseEntity> {
  config: EntityConfig<T>;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  hideDefaultAddButton?: boolean;
}

export function EntityPage<T extends BaseEntity>({ 
  config, 
  pageSize = 10,
  onRowClick,
  hideDefaultAddButton = false
}: EntityPageProps<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const {
    data,
    loading,
    error,
    count,
    page,
    totalPages,
    sort,
    create,
    update,
    delete: deleteItem,
    setSort,
    setPage,
    setSearch,
    search,
    clearError
  } = useCrud<T>({
    tableName: config.tableName,
    searchFields: config.searchFields,
    defaultSort: config.defaultSort,
    pageSize,
    foreignKeys: config.foreignKeys
  });

  const handleSave = async (formData: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editing) {
        await update(editing.id!, formData as Partial<T>);
      } else {
        await create(formData);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      // Error is handled by the hook
      console.error('Error saving entity:', error);
    }
  };

  const handleEdit = (item: T) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem(id);
    } catch (error) {
      console.error('Error deleting entity:', error);
    }
  };

  const handleSort = (field: keyof T) => {
    setSort({ field, asc: sort.field === field ? !sort.asc : true });
  };

  const handleAddNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditing(null);
    clearError();
  };

  // Create table columns from config
  const columns = config.fields
    .filter(field => !field.hiddenInTable) // Filtrar campos ocultos en la tabla
    .map(field => {
      const foreignKeyConfig = config.foreignKeys?.find(fk => fk.foreignKey === field.name);
      
      return {
        key: field.name as keyof T,
        label: field.label,
        sortable: config.sortableFields.includes(field.name as keyof T),
        foreignKey: foreignKeyConfig ? {
          tableName: foreignKeyConfig.tableName,
          displayField: foreignKeyConfig.displayField,
          alias: foreignKeyConfig.alias
        } : undefined,
        // Solo usar renderValue si no hay foreignKey configurado
        render: (!foreignKeyConfig && config.renderValue) ? (value: any, item: T) => {
          return config.renderValue!(field.name, value);
        } : undefined
      };
    });

  // Determine if we need dynamic modal (has foreign keys that need dynamic options)
  const needsDynamicModal = config.fields.some(field => 
    field.name.includes('_id') && field.type === 'select' && 
    (field.name === 'country_id' || field.name === 'state_id' || field.name === 'city_id' || field.name === 'zone_id' || field.name === 'diocese_id' || field.name === 'parish_id' || field.name === 'spouse_id' || field.name === 'step_way_id')
  );

  return (
    <div className="w-full bg-white rounded-lg border shadow-sm p-6">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search and Add Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex items-center w-full max-w-sm">
          <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder={
              config.displayName === 'Comunidad'
                ? 'Buscar por número o parroquia...'
                : `Buscar ${config.displayName.toLowerCase()}...`
            }
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-8 w-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        {!hideDefaultAddButton && (
          <Button
            color="amber"
            highContrast
            size="2"
            onClick={handleAddNew}
          >
            <Plus className="w-4 h-4" />
            Agregar {config.displayName.toLowerCase()}
          </Button>
        )}
      </div>

      {/* Table */}
      <EntityTable
        data={data}
        columns={columns}
        loading={loading}
        sort={sort}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={onRowClick}
        emptyMessage={`No hay ${config.displayName.toLowerCase()}s`}
      />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages || 1}
          {count > 0 && ` — ${count} registros`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="2"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          {/* Page numbers */}
          {totalPages > 1 && (() => {
            const pages: (number | string)[] = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (page > 3) pages.push('...');
              for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                pages.push(i);
              }
              if (page < totalPages - 2) pages.push('...');
              pages.push(totalPages);
            }
            return pages.map((p, idx) =>
              typeof p === 'string' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "solid" : "outline"}
                  size="2"
                  onClick={() => setPage(p)}
                  color={p === page ? "amber" : undefined}
                  highContrast={p === page}
                >
                  {p}
                </Button>
              )
            );
          })()}

          <Button
            variant="outline"
            size="2"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modal */}
      {needsDynamicModal ? (
        <DynamicEntityModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          initial={editing}
          fields={config.fields}
          title={editing ? `Editar ${config.displayName.toLowerCase()}` : `Agregar ${config.displayName.toLowerCase()}`}
          loading={loading}
        />
      ) : (
        <EntityModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          initial={editing}
          fields={config.fields}
          title={editing ? `Editar ${config.displayName.toLowerCase()}` : `Agregar ${config.displayName.toLowerCase()}`}
          loading={loading}
        />
      )}
    </div>
  );
} 