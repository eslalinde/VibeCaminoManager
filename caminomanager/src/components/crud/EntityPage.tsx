import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EntityTable } from './EntityTable';
import { EntityModal } from './EntityModal';
import { DynamicEntityModal } from './DynamicEntityModal';
import { useCrud } from '@/hooks/useCrud';
import { BaseEntity, FormField, EntityConfig } from '@/types/database';

interface EntityPageProps<T extends BaseEntity> {
  config: EntityConfig<T>;
  pageSize?: number;
}

export function EntityPage<T extends BaseEntity>({ 
  config, 
  pageSize = 10 
}: EntityPageProps<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [search, setSearch] = useState('');

  const {
    data,
    loading,
    error,
    count,
    page,
    totalPages,
    sort,
    fetchData,
    create,
    update,
    delete: deleteItem,
    setSort,
    setPage,
    clearError
  } = useCrud<T>({
    tableName: config.tableName,
    searchFields: config.searchFields,
    defaultSort: config.defaultSort,
    pageSize,
    foreignKeys: config.foreignKeys
  });

  // Fetch data when search, sort, or page changes
  useEffect(() => {
    fetchData({ search, sort: { field: sort.field as string, asc: sort.asc }, page });
  }, [search, sort, page]);

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
  const columns = config.fields.map(field => {
    const foreignKeyConfig = config.foreignKeys?.find(fk => fk.foreignKey === field.name);
    
    return {
      key: field.name as keyof T,
      label: field.label,
      sortable: config.sortableFields.includes(field.name as keyof T),
      foreignKey: foreignKeyConfig ? {
        tableName: foreignKeyConfig.tableName,
        displayField: foreignKeyConfig.displayField
      } : undefined
    };
  });

  // Determine if we need dynamic modal (has foreign keys that need dynamic options)
  const needsDynamicModal = config.fields.some(field => 
    field.name.includes('_id') && field.type === 'select' && 
    (field.name === 'country_id' || field.name === 'state_id' || field.name === 'city_id' || field.name === 'parish_id')
  );

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="flex-1 w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{config.displayName}</CardTitle>
          <Button 
            color="amber" 
            highContrast 
            onClick={handleAddNew}
          >
            Agregar {config.displayName.toLowerCase()}
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder={`Buscar ${config.displayName.toLowerCase()}...`}
              value={search}
              onChange={e => { 
                setSearch(e.target.value); 
                setPage(1); 
              }}
              className="max-w-xs"
            />
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
            emptyMessage={`No hay ${config.displayName.toLowerCase()}s`}
          />

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span>
              Página {page} de {totalPages || 1} 
              {count > 0 && ` (${count} total)`}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPage(Math.max(1, page - 1))} 
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPage(Math.min(totalPages, page + 1))} 
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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