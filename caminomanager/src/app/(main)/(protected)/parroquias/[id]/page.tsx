'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useParishData } from '@/hooks/useParishData';
import { ParishInfo } from '@/components/crud/ParishInfo';
import { PriestsList } from '@/components/crud/PriestsList';
import { DynamicEntityModal } from '@/components/crud/DynamicEntityModal';
import { parishConfig } from '@/config/entities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Parish } from '@/types/database';
import { routes } from '@/lib/routes';

export default function ParishDetailPage() {
  const params = useParams();
  const router = useRouter();
  const parishId = parseInt(params.id as string);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    parish,
    priests,
    communities,
    loading,
    error,
    refreshParish,
  } = useParishData(parishId);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = async (data: Omit<Parish, 'id' | 'created_at' | 'updated_at'>) => {
    if (!parish?.id) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: updatedRows, error: updateError } = await supabase
        .from('parishes')
        .update(data)
        .eq('id', parish.id)
        .select();

      if (updateError) throw updateError;

      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('No tienes permisos para editar parroquias. Contacta al administrador para que te asigne el rol de contributor o admin.');
      }

      await refreshParish();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating parish:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="2"
            onClick={() => router.push(routes.parroquias)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar a Parroquias
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {parish?.name || 'Cargando...'}
        </h1>
        <p className="text-gray-600 mt-2">
          {parish?.diocese?.name || 'Diócesis no especificada'}
        </p>
      </div>

      {/* Main Content - 2 column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Parish Info + Communities */}
        <div className="space-y-6">
          {/* Parish Info */}
          <ParishInfo parish={parish} loading={loading} onEdit={handleEdit} />

          {/* Communities summary */}
          <Card>
            <CardHeader>
              <CardTitle>Comunidades ({communities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : communities.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay comunidades en esta parroquia</p>
              ) : (
                <div className="space-y-2">
                  {communities.map((community) => (
                    <div
                      key={community.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(routes.comunidad(community.id!))}
                    >
                      <div>
                        <span className="font-medium">Comunidad {community.number}</span>
                        {community.step_way && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({community.step_way.name})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {community.actual_brothers ? `${community.actual_brothers} hermanos` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Priests List */}
        <div>
          <PriestsList
            priests={priests}
            loading={loading}
            parishId={parishId}
            onRefresh={refreshParish}
          />
        </div>
      </div>

      {/* Modal de edición */}
      <DynamicEntityModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        initial={parish}
        fields={parishConfig.fields}
        title="Editar Parroquia"
        loading={isSaving}
      />
    </div>
  );
}
