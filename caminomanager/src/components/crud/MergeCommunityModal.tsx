'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Theme } from '@radix-ui/themes';
import { createClient } from '@/utils/supabase/client';

interface CommunityOption {
  id: number;
  number: string;
  actual_brothers: number | null;
}

interface PreviewData {
  brothers: number;
  teamMembers: number;
  stepLogs: number;
}

interface MergeCommunityModalProps {
  open: boolean;
  onClose: () => void;
  keepCommunityId: number;
  keepCommunityNumber: string;
  parishId: number;
  onSuccess: () => Promise<void>;
}

export function MergeCommunityModal({
  open,
  onClose,
  keepCommunityId,
  keepCommunityNumber,
  parishId,
  onSuccess,
}: MergeCommunityModalProps) {
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar comunidades de la misma parroquia
  useEffect(() => {
    if (!open || !parishId) return;

    const fetchCommunities = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('communities')
        .select('id, number, actual_brothers')
        .eq('parish_id', parishId)
        .neq('id', keepCommunityId)
        .order('number');

      if (error) {
        console.error('Error fetching communities:', error);
        return;
      }
      setCommunities(data || []);
    };

    fetchCommunities();
  }, [open, parishId, keepCommunityId]);

  // Cargar preview al seleccionar comunidad
  useEffect(() => {
    if (!selectedCommunityId) {
      setPreview(null);
      return;
    }

    const fetchPreview = async () => {
      setLoadingPreview(true);
      const supabase = createClient();

      const [brothersRes, membersRes, logsRes] = await Promise.all([
        supabase
          .from('brothers')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', selectedCommunityId),
        supabase
          .from('belongs')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', selectedCommunityId),
        supabase
          .from('community_step_log')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', selectedCommunityId),
      ]);

      setPreview({
        brothers: brothersRes.count ?? 0,
        teamMembers: membersRes.count ?? 0,
        stepLogs: logsRes.count ?? 0,
      });
      setLoadingPreview(false);
    };

    fetchPreview();
  }, [selectedCommunityId]);

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setSelectedCommunityId(null);
    setPreview(null);
    setConfirmText('');
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleMerge = async () => {
    if (!selectedCommunityId || confirmText !== 'FUSIONAR') return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc('merge_communities', {
        p_keep_community_id: keepCommunityId,
        p_remove_community_id: selectedCommunityId,
      });

      if (rpcError) throw rpcError;

      const result = data as { success: boolean; brothers_moved: number; members_moved: number; removed_community_number: string };

      alert(
        `Fusión exitosa. Se movieron ${result.brothers_moved} hermano(s) y ${result.members_moved} miembro(s) de equipo de la Comunidad ${result.removed_community_number}.`
      );

      resetAndClose();
      await onSuccess();
    } catch (err: any) {
      console.error('Error merging communities:', err);
      setError(err.message || 'Error al fusionar las comunidades');
    } finally {
      setLoading(false);
    }
  };

  const selectedCommunity = communities.find((c) => c.id === selectedCommunityId);
  const isConfirmValid = confirmText === 'FUSIONAR';

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <Theme>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              Fusionar Comunidades
            </DialogTitle>
            <DialogDescription>
              La Comunidad {keepCommunityNumber} absorberá a la comunidad seleccionada.
              Todos los datos se transferirán y la comunidad seleccionada será eliminada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Comunidad principal */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Comunidad Principal (permanece)</p>
              <p className="text-lg font-semibold text-green-900">Comunidad {keepCommunityNumber}</p>
            </div>

            {/* Selector de comunidad a absorber */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar comunidad a absorber:
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={selectedCommunityId ?? ''}
                onChange={(e) => setSelectedCommunityId(e.target.value ? Number(e.target.value) : null)}
                disabled={loading}
              >
                <option value="">-- Seleccionar comunidad --</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    Comunidad {c.number} ({c.actual_brothers ?? 0} hermanos)
                  </option>
                ))}
              </select>
            </div>

            {/* Vista previa */}
            {selectedCommunityId && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista previa de la fusión:</p>
                {loadingPreview ? (
                  <p className="text-sm text-gray-500">Cargando datos...</p>
                ) : preview ? (
                  <div className="space-y-1 text-sm">
                    <p>Hermanos a transferir: <span className="font-semibold">{preview.brothers}</span></p>
                    <p>Miembros de equipos: <span className="font-semibold">{preview.teamMembers}</span></p>
                    <p>Registros de bitácora: <span className="font-semibold">{preview.stepLogs}</span></p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Confirmación */}
            {selectedCommunityId && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <p className="text-sm text-red-700 font-medium">
                  Esta acción es IRREVERSIBLE. La Comunidad {selectedCommunity?.number} será eliminada permanentemente.
                </p>
                <p className="text-sm text-red-600">
                  Escribe <span className="font-bold">FUSIONAR</span> para confirmar:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Escribe FUSIONAR"
                  disabled={loading}
                  className="border-red-300 focus:ring-red-500"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={resetAndClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleMerge}
              disabled={!selectedCommunityId || !isConfirmValid || loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? 'Fusionando comunidades...' : 'Fusionar'}
            </Button>
          </DialogFooter>
        </Theme>
      </DialogContent>
    </Dialog>
  );
}
