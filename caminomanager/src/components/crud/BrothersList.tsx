import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MergedBrother } from '@/hooks/useCommunityData';
import { Belongs } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import { Trash2 } from 'lucide-react';

interface BrothersListProps {
  brothers: MergedBrother[];
  loading?: boolean;
  communityId: number;
  teamMembers: Record<number, Belongs[]>;
  onDelete?: () => void;
}

export function BrothersList({ brothers, loading, communityId, teamMembers, onDelete }: BrothersListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Check if a brother is associated with any team
  const isBrotherInTeam = (brother: MergedBrother): boolean => {
    // Get all person IDs from all teams in this community
    const allTeamPersonIds = new Set<number>();
    Object.values(teamMembers).forEach(members => {
      members.forEach(member => {
        // Verify the member belongs to this community
        if (member.person_id && member.community_id === communityId) {
          allTeamPersonIds.add(member.person_id);
        }
      });
    });

    // Check if any of the brother's person IDs are in any team
    return brother.personIds.some(personId => allTeamPersonIds.has(personId));
  };

  const handleDelete = async (brother: MergedBrother) => {
    if (isBrotherInTeam(brother)) {
      alert('No se puede eliminar este hermano porque está asociado a un equipo dentro de la comunidad.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${brother.name} de esta comunidad?`)) {
      return;
    }

    setDeletingId(brother.id);
    try {
      const supabase = createClient();
      
      // Delete all brother records for all person IDs in this merged brother
      for (const personId of brother.personIds) {
        const { error } = await supabase
          .from('brothers')
          .delete()
          .eq('person_id', personId)
          .eq('community_id', communityId);

        if (error) throw error;
      }

      // Refresh the community data
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting brother:', error);
      alert('Error al eliminar el hermano. Por favor, intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Cargando hermanos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Hermanos de la Comunidad</CardTitle>
        <p className="text-sm text-gray-600">
          Total: {brothers.length} {brothers.length === 1 ? 'hermano' : 'hermanos'}
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Carisma</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brothers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No hay hermanos registrados
                  </TableCell>
                </TableRow>
              ) : (
                brothers.map((brother) => {
                  const isInTeam = isBrotherInTeam(brother);
                  const isDeleting = deletingId === brother.id;
                  
                  return (
                    <TableRow key={brother.id}>
                      <TableCell className="font-medium">
                        {brother.name}
                        {brother.isMarriage && (
                          <span className="ml-2 text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                            Matrimonio
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{brother.carisma}</TableCell>
                      <TableCell>{brother.celular || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="1"
                          variant="outline"
                          radius="small"
                          color={isInTeam ? "gray" : "red"}
                          onClick={() => handleDelete(brother)}
                          disabled={isInTeam || isDeleting}
                          title={isInTeam ? 'Este hermano está asociado a un equipo y no puede ser eliminado' : 'Eliminar hermano de la comunidad'}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
