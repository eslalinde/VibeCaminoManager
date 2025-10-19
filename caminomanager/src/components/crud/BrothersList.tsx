import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MergedBrother } from '@/hooks/useCommunityData';

interface BrothersListProps {
  brothers: MergedBrother[];
  loading?: boolean;
}

export function BrothersList({ brothers, loading }: BrothersListProps) {
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {brothers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                    No hay hermanos registrados
                  </TableCell>
                </TableRow>
              ) : (
                brothers.map((brother) => (
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
