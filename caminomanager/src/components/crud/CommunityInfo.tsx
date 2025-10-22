import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Community } from '@/types/database';
import { Edit } from 'lucide-react';

interface CommunityInfoProps {
  community: Community | null;
  loading?: boolean;
  onEdit?: () => void;
}

export function CommunityInfo({ community, loading, onEdit }: CommunityInfoProps) {
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

  if (!community) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Información de la Comunidad</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No se encontró información de la comunidad</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const calculateYears = (dateString?: string) => {
    if (!dateString) return '';
    const birthDate = new Date(dateString);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Si aún no ha cumplido años este año, restar 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return years - 1;
    }
    
    return years;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Información de la Comunidad</CardTitle>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
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
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Número</label>
            <p className="text-sm font-semibold text-gray-900">{community.number}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hermanos Actuales</label>
            <p className="text-sm font-semibold text-gray-700">{community.actual_brothers || 'No especificado'}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de Nacimiento</label>
            <p className="text-sm text-gray-700">
              {formatDate(community.born_date)}
              {community.born_date && (
                <span className="ml-2 text-xs text-gray-500">
                  ({calculateYears(community.born_date)} años)
                </span>
              )}
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hermanos Iniciales</label>
            <p className="text-sm text-gray-700">{community.born_brothers || 'No especificado'}</p>
          </div>
          
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Parroquia</label>
            <p className="text-sm text-gray-700">{community.parish?.name || 'No especificada'}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Etapa Actual</label>
            <p className="text-sm text-gray-700">{community.step_way?.name || 'No especificada'}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Última Etapa</label>
            <p className="text-sm text-gray-700">{formatDate(community.last_step_way_date)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
