import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { BaseEntity } from '@/types/database';
import { Pencil, Trash2 } from 'lucide-react';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
  foreignKey?: {
    tableName: string;
    displayField: string;
    alias?: string;
  };
}

interface EntityTableProps<T extends BaseEntity> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  sort: { field: keyof T; asc: boolean };
  onSort: (field: keyof T) => void;
  onEdit: (item: T) => void;
  onDelete: (id: number) => void | Promise<void>;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  hideDeleteInTable?: boolean;
}

// Helper function to render foreign key values
function renderForeignKeyValue<T extends BaseEntity>(
  item: T,
  key: keyof T,
  foreignKey: { tableName: string; displayField: string; alias?: string }
): string {
  // Use alias if available, otherwise use table name
  const propertyName = foreignKey.alias || foreignKey.tableName;
  const relatedData = (item as any)[propertyName];

  // Check if the related data exists and has the display field
  if (relatedData && typeof relatedData === 'object') {
    return String(relatedData[foreignKey.displayField] || '');
  }

  // Fallback to showing the ID if no JOIN data is available
  const foreignKeyData = item[key] as any;
  return String(foreignKeyData || '');
}

export function EntityTable<T extends BaseEntity>({
  data,
  columns,
  loading,
  sort,
  onSort,
  onEdit,
  onDelete,
  onRowClick,
  emptyMessage = "No hay datos",
  hideDeleteInTable = false
}: EntityTableProps<T>) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Try to get a display label for the item being deleted
  const getItemLabel = (item: T): string => {
    // Try common name fields
    const nameField = (item as any).name || (item as any).person_name || (item as any).number;
    return nameField ? String(nameField) : `#${item.id}`;
  };

  return (
    <div className="overflow-x-auto">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead
                key={String(column.key)}
                className={`whitespace-nowrap ${column.sortable ? "cursor-pointer hover:bg-gray-50" : ""}`}
                style={column.width ? { width: column.width } : undefined}
                onClick={() => column.sortable && onSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.sortable && sort.field === column.key && (
                    <span className="text-sm">
                      {sort.asc ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
            <TableHead className="whitespace-nowrap" style={{ width: '140px' }}>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center py-8">
                Cargando...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow
                key={item.id || index}
                className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map(column => (
                  <TableCell key={String(column.key)} className="truncate">
                    {column.render
                      ? column.render(item[column.key], item)
                      : column.foreignKey
                        ? renderForeignKeyValue(item, column.key, column.foreignKey)
                        : String(item[column.key] || '')
                    }
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <Button
                      size="2"
                      variant="solid"
                      radius="small"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onRowClick ? onRowClick(item) : onEdit(item);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </Button>
                    {!hideDeleteInTable && (
                      <Button
                        size="2"
                        variant="outline"
                        radius="small"
                        color="red"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (item.id) {
                            setDeleteTarget({ id: item.id, label: getItemLabel(item) });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog */}
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirmed}
        title="¿Eliminar registro?"
        description={`¿Estás seguro de que deseas eliminar "${deleteTarget?.label}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
