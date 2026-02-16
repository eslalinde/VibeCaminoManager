'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { CommunityStepLog as CommunityStepLogType } from '@/types/database';
import { Calendar, FileText, ChevronDown, ChevronUp, ExternalLink, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { DynamicEntityModal } from '@/components/crud/DynamicEntityModal';
import { communityStepLogConfig } from '@/config/entities';
import { DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Theme } from '@radix-ui/themes';
import { createClient } from '@/utils/supabase/client';

interface CommunityStepLogCompactProps {
  communityId: number;
  communityNumber: string;
  onStepLogAdded?: () => void;
  defaultCatechistName?: string;
  actualBrothers?: number;
}

export function CommunityStepLogCompact({ communityId, communityNumber, onStepLogAdded, defaultCatechistName, actualBrothers }: CommunityStepLogCompactProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 2;

  const foreignKeys = useMemo(() => [
    {
      foreignKey: 'step_way_id',
      tableName: 'step_ways',
      displayField: 'name',
      alias: 'step_way'
    }
  ], []);

  const { data: stepLogs, loading, count, fetchData, create, delete: deleteEntry } = useCrud<CommunityStepLogType>({
    tableName: 'community_step_log',
    searchFields: ['principal_catechist_name', 'notes'],
    defaultSort: { field: 'id', asc: false },
    pageSize: 10, // Usar un pageSize fijo más grande
    foreignKeys
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

  const getOutcomeBadge = (outcome?: boolean) => {
    if (outcome === true) {
      return <Badge variant="default" className="bg-green-100 text-green-800 text-sm"><CheckCircle className="w-4 h-4 mr-1" />Cerrada</Badge>;
    } else if (outcome === false) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-sm"><XCircle className="w-4 h-4 mr-1" />Abierta</Badge>;
    }
    return null;
  };

  const handleAddEntry = async (data: any) => {
    setIsSaving(true);
    try {
      // Extraer campo virtual brothers_count
      const brothersCount = data.brothers_count ? parseInt(data.brothers_count, 10) : null;
      delete data.brothers_count;

      // Anexar hermanos a las notas si se proporcionó
      if (brothersCount) {
        data.notes = data.notes
          ? `${data.notes}\nHermanos: ${brothersCount}`
          : `Hermanos: ${brothersCount}`;
      }

      // Convertir outcome de string a boolean
      const outcomeValue = data.outcome === 'true' ? true : data.outcome === 'false' ? false : null;

      const entryData: Omit<CommunityStepLogType, 'id' | 'created_at' | 'updated_at'> = {
        ...data,
        community_id: communityId,
        outcome: outcomeValue,
      };

      await create(entryData);

      // Preparar actualización de la comunidad
      const communityUpdate: Record<string, any> = {};

      // Si el paso está "Cerrada" y tiene step_way_id, actualizar etapa
      if (outcomeValue === true && data.step_way_id) {
        communityUpdate.step_way_id = parseInt(data.step_way_id, 10);
        communityUpdate.last_step_way_date = data.date_of_step || new Date().toISOString().split('T')[0];
      }

      // Actualizar hermanos actuales si se proporcionó
      if (brothersCount) {
        communityUpdate.actual_brothers = brothersCount;
      }

      // Hacer un solo update a la comunidad si hay algo que actualizar
      if (Object.keys(communityUpdate).length > 0) {
        const supabase = createClient();
        await supabase
          .from('communities')
          .update(communityUpdate)
          .eq('id', communityId);

        onStepLogAdded?.();
      }

      setIsAddModalOpen(false);
      await fetchData({ filters: { community_id: communityId } });
    } catch (error) {
      console.error('Error adding step log entry:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Preparar los campos del formulario, excluyendo community_id y agregando hermanos (virtual)
  const formFields = useMemo(() => {
    const fields = communityStepLogConfig.fields.filter(field => field.name !== 'community_id');
    // Insertar campo virtual de hermanos antes de notas
    const notesIndex = fields.findIndex(f => f.name === 'notes');
    fields.splice(notesIndex >= 0 ? notesIndex : fields.length, 0, {
      name: 'brothers_count',
      label: 'Hermanos Actuales',
      type: 'number',
      required: false,
      placeholder: 'Número de hermanos actuales',
    });
    return fields;
  }, []);

  const handleDeleteClick = (entryId: number) => {
    setDeletingId(entryId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId || isDeleting) return;
    
    setIsDeleting(true);
    try {
      // Eliminar el registro directamente con Supabase para tener más control
      const supabase = createClient();
      const { error } = await supabase
        .from('community_step_log')
        .delete()
        .eq('id', deletingId);
      
      if (error) throw error;
      
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      
      // Refrescar los datos con los filtros correctos
      await fetchData({ filters: { community_id: communityId } });
    } catch (error) {
      console.error('Error deleting step log entry:', error);
      alert('Error al eliminar el registro. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };


  // Mostrar solo los primeros 2 elementos en la vista compacta
  const displayedLogs = stepLogs.slice(0, itemsPerPage);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Bitácora</CardTitle>
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
          <CardTitle className="text-lg">Bitácora</CardTitle>
          <div className="flex items-center gap-2 print-hidden">
            <Button
              variant="outline"
              size="2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
            {count > itemsPerPage && (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="2"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(entry.date_of_step)}</span>
                            </div>
                            {entry.step_way && (
                              <Badge variant="outline">{entry.step_way.name}</Badge>
                            )}
                            {getOutcomeBadge(entry.outcome)}
                          </div>
                          <Button
                            variant="outline"
                            size="2"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(entry.id!)}
                            disabled={deletingId === entry.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        {/* Vista normal (pantalla) - solo muestra los primeros 2 */}
        <div className="print-hidden">
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
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(entry.date_of_step)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.step_way && (
                        <Badge variant="outline">{entry.step_way.name}</Badge>
                      )}
                      {getOutcomeBadge(entry.outcome)}
                      <Button
                        variant="ghost"
                        size="2"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(entry.id!)}
                        disabled={deletingId === entry.id}
                        title="Eliminar evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Comentario debajo */}
                  {entry.notes && (
                    <div className="text-sm text-gray-700">
                      <p className="line-clamp-2">{entry.notes}</p>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

        {/* Vista de impresión - muestra TODOS los registros en tabla compacta */}
        <div className="hidden print:block">
          {stepLogs.length === 0 ? (
            <p className="text-sm text-gray-500">No hay entradas en la bitácora</p>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 px-2 font-semibold">Fecha</th>
                  <th className="text-left py-1 px-2 font-semibold">Paso</th>
                  <th className="text-left py-1 px-2 font-semibold">Estado</th>
                  <th className="text-left py-1 px-2 font-semibold">Notas</th>
                </tr>
              </thead>
              <tbody>
                {stepLogs.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200">
                    <td className="py-1 px-2 whitespace-nowrap">{formatDate(entry.date_of_step)}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{entry.step_way?.name || '-'}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{entry.outcome === true ? 'Cerrada' : entry.outcome === false ? 'Abierta' : '-'}</td>
                    <td className="py-1 px-2">{entry.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>

      {/* Modal para agregar nuevo registro */}
      <DynamicEntityModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddEntry}
        initial={{
          date_of_step: new Date().toISOString().split('T')[0],
          principal_catechist_name: defaultCatechistName || '',
          brothers_count: actualBrothers || '',
        } as any}
        fields={formFields}
        title="Agregar Registro a la Bitácora"
        loading={isSaving}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
        }
      }}>
        <DialogContent>
          <Theme>
            <DialogHeader>
              <DialogTitle>¿Eliminar evento de bitácora?</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este evento de la bitácora? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                size="2"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingId(null);
                }}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                color="red"
                size="2"
                onClick={handleDeleteConfirm}
                disabled={isDeleting || !deletingId}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </Theme>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
