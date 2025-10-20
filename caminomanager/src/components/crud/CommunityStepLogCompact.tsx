'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { CommunityStepLog as CommunityStepLogType } from '@/types/database';
import { Calendar, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface CommunityStepLogCompactProps {
  communityId: number;
  communityNumber: string;
}

export function CommunityStepLogCompact({ communityId, communityNumber }: CommunityStepLogCompactProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 2;

  const { data: stepLogs, loading, count, fetchData } = useCrud<CommunityStepLogType>({
    tableName: 'community_step_log',
    searchFields: ['principal_catechist_name', 'notes'],
    defaultSort: { field: 'date_of_step', asc: false },
    pageSize: 10, // Usar un pageSize fijo más grande
    foreignKeys: [
      {
        foreignKey: 'step_way_id',
        tableName: 'step_ways',
        displayField: 'name',
        alias: 'step_way'
      }
    ]
  });

  useEffect(() => {
    if (communityId) {
      fetchData({ 
        filters: { community_id: communityId }
      });
    }
  }, [communityId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-CO');
  };


  // Mostrar solo los primeros 2 elementos en la vista compacta
  const displayedLogs = stepLogs.slice(0, itemsPerPage);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            Bitácora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            Bitácora
          </CardTitle>
          {count > itemsPerPage && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="2"
                  className="h-6 px-2 text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Ver todos ({count})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Bitácora - Comunidad {communityNumber}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {stepLogs.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(entry.date_of_step)}</span>
                        </div>
                        {entry.step_way && (
                          <Badge variant="outline">{entry.step_way.name}</Badge>
                        )}
                      </div>
                      
                      {entry.notes && (
                        <div className="text-sm text-gray-700">
                          <p className="font-medium mb-1">Comentario:</p>
                          <p className="whitespace-pre-wrap">{entry.notes}</p>
                        </div>
                      )}
                      
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div>
          <div className="space-y-3">
            {displayedLogs.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay entradas en el log</p>
              </div>
            ) : (
              displayedLogs.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-3 space-y-2">
                  {/* Fecha y paso en la misma línea */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(entry.date_of_step)}</span>
                    </div>
                    {entry.step_way && (
                      <Badge variant="outline" className="text-xs">{entry.step_way.name}</Badge>
                    )}
                  </div>
                  
                  {/* Comentario debajo */}
                  {entry.notes && (
                    <div className="text-xs text-gray-700">
                      <p className="line-clamp-2">{entry.notes}</p>
                    </div>
                  )}
                  
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
