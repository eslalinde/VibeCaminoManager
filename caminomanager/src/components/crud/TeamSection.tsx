import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Team, Belongs } from '@/types/database';

interface TeamSectionProps {
  team: Team;
  members: Belongs[];
  loading?: boolean;
  teamNumber?: number;
}

export function TeamSection({ team, members, loading, teamNumber }: TeamSectionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando equipo...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCarismaLabel = (personTypeId?: number) => {
    const carismaOptions = [
      { value: 1, label: 'Casado' },
      { value: 2, label: 'Soltero' },
      { value: 3, label: 'Presbítero' },
      { value: 4, label: 'Seminarista' },
      { value: 5, label: 'Diácono' },
      { value: 6, label: 'Monja' },
      { value: 7, label: 'Viudo' }
    ];
    
    return carismaOptions.find(opt => opt.value === personTypeId)?.label || 'No especificado';
  };

  // Merge married couples in team members
  const mergedMembers = (() => {
    const processedIds = new Set<number>();
    const merged: Array<{
      id: string;
      name: string;
      carisma: string;
      mobile: string;
      isResponsible: boolean;
      isMarriage: boolean;
      isPresbitero: boolean;
    }> = [];

    members.forEach(member => {
      if (processedIds.has(member.person_id)) return;

      const person = member.person;
      if (!person) return;

      // Check if this person is married and spouse is also in the team
      if (person.spouse_id) {
        const spouseMember = members.find(m => 
          m.person_id === person.spouse_id && 
          !processedIds.has(m.person_id)
        );

        if (spouseMember && spouseMember.person) {
          // Create merged marriage entry
          const husband = person.gender_id === 1 ? person : spouseMember.person;
          const wife = person.gender_id === 2 ? person : spouseMember.person;
          
          merged.push({
            id: `marriage-${person.id}-${spouseMember.person_id}`,
            name: `${husband.person_name} y ${wife.person_name}`,
            carisma: 'Casado',
            mobile: husband.mobile || wife.mobile || '',
            isResponsible: member.is_responsible_for_the_team || spouseMember.is_responsible_for_the_team,
            isMarriage: true,
            isPresbitero: false // Married couples are not presbíteros
          });

          if (person.id) processedIds.add(person.id);
          if (spouseMember.person_id) processedIds.add(spouseMember.person_id);
          return;
        }
      }

      // Single person
      const carisma = getCarismaLabel(person.person_type_id);
      merged.push({
        id: `person-${person.id}`,
        name: person.person_name,
        carisma: carisma,
        mobile: person.mobile || '',
        isResponsible: member.is_responsible_for_the_team,
        isMarriage: false,
        isPresbitero: person.person_type_id === 3 // person_type_id 3 = Presbítero
      });

      if (person.id) processedIds.add(person.id);
    });

    return merged;
  })();

  const getTeamTitle = () => {
    if (team.team_type_id === 4) {
      return 'Equipo de Responsables';
    } else if (team.team_type_id === 3) {
      return teamNumber ? `Equipo de Catequistas ${teamNumber}` : 'Equipo de Catequistas';
    }
    return team.name;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{getTeamTitle()}</CardTitle>
        <p className="text-sm text-gray-600">
          {mergedMembers.length} {mergedMembers.length === 1 ? 'miembro' : 'miembros'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                    No hay miembros en este equipo
                  </TableCell>
                </TableRow>
              ) : (
                mergedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.name}
                      {member.isMarriage && (
                        <span className="ml-2 text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                          Matrimonio
                        </span>
                      )}
                      {team.team_type_id === 3 ? (
                        <>
                          {member.isResponsible && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Responsable
                            </span>
                          )}
                          {member.isPresbitero && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              Presbítero
                            </span>
                          )}
                          {member.carisma === 'Seminarista' && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Seminarista
                            </span>
                          )}
                          {member.carisma === 'Soltero' && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              Soltero
                            </span>
                          )}
                          {member.carisma === 'Diácono' && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Diácono
                            </span>
                          )}
                          {member.carisma === 'Monja' && (
                            <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                              Monja
                            </span>
                          )}
                          {member.carisma === 'Viudo' && (
                            <span className="ml-2 text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                              Viudo
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {member.isResponsible ? (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Responsable
                            </span>
                          ) : (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              Corresponsable
                            </span>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.mobile || '-'}
                    </TableCell>
                    <TableCell>
                      {/* Acciones - por implementar */}
                      <span className="text-gray-400 text-sm">-</span>
                    </TableCell>
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
