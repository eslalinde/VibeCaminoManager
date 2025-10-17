import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { BaseEntity } from '@/types/database';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

interface EntityTableProps<T extends BaseEntity> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  sort: { field: keyof T; asc: boolean };
  onSort: (field: keyof T) => void;
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
  emptyMessage?: string;
}

export function EntityTable<T extends BaseEntity>({
  data,
  columns,
  loading,
  sort,
  onSort,
  onEdit,
  onDelete,
  emptyMessage = "No hay datos"
}: EntityTableProps<T>) {
  const handleDelete = (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
    onDelete(id);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead 
                key={String(column.key)}
                className={column.sortable ? "cursor-pointer hover:bg-gray-50" : ""}
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
            <TableHead>Acciones</TableHead>
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
              <TableRow key={item.id || index}>
                {columns.map(column => (
                  <TableCell key={String(column.key)}>
                    {column.render 
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '')
                    }
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="1" 
                      variant="solid" 
                      radius="small" 
                      onClick={() => onEdit(item)}
                    >
                      Editar
                    </Button>
                    <Button 
                      size="1" 
                      variant="outline" 
                      radius="small" 
                      onClick={() => handleDelete(item.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 