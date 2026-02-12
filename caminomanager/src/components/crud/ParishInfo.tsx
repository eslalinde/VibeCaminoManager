import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Parish } from '@/types/database';
import { Edit } from 'lucide-react';

interface ParishInfoProps {
  parish: Parish | null;
  loading?: boolean;
  onEdit?: () => void;
}

export function ParishInfo({ parish, loading, onEdit }: ParishInfoProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando información...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!parish) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Información de la Parroquia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No se encontró información de la parroquia</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Información de la Parroquia</CardTitle>
          {onEdit && (
            <Button
              variant="outline"
              size="1"
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</label>
            <p className="text-sm font-semibold text-gray-900">{parish.name}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Diócesis</label>
            <p className="text-sm text-gray-700">{parish.diocese || 'No especificada'}</p>
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dirección</label>
            <p className="text-sm text-gray-700">{parish.address || 'No especificada'}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</label>
            <p className="text-sm text-gray-700">{parish.phone || 'No especificado'}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
            <p className="text-sm text-gray-700">{parish.email || 'No especificado'}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ciudad</label>
            <p className="text-sm text-gray-700">{parish.city?.name || 'No especificada'}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Departamento</label>
            <p className="text-sm text-gray-700">{parish.state?.name || 'No especificado'}</p>
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">País</label>
            <p className="text-sm text-gray-700">{parish.country?.name || 'No especificado'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
