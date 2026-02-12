import { Community, Team, Belongs, Parish, CommunityStepLog } from '@/types/database';

interface CommunityPrintViewProps {
  community: Community | null;
  teams: { responsables: Team[]; catequistas: Team[] };
  teamMembers: Record<number, Belongs[]>;
  teamParishes: Record<number, Parish[]>;
  stepLogs: CommunityStepLog[];
}

interface MergedTeamMember {
  id: string;
  name: string;
  carisma: string;
  mobile: string;
  isResponsible: boolean;
  isMarriage: boolean;
}

function getCarismaLabel(personTypeId?: number): string {
  const carismaOptions = [
    { value: 1, label: 'Casado' },
    { value: 2, label: 'Soltero' },
    { value: 3, label: 'Presbitero' },
    { value: 4, label: 'Seminarista' },
    { value: 5, label: 'Diacono' },
    { value: 6, label: 'Monja' },
    { value: 7, label: 'Viudo' },
  ];
  return carismaOptions.find((opt) => opt.value === personTypeId)?.label || '';
}

function mergeTeamMembers(members: Belongs[]): MergedTeamMember[] {
  const processedIds = new Set<number>();
  const merged: MergedTeamMember[] = [];

  members.forEach((member) => {
    if (processedIds.has(member.person_id)) return;
    const person = member.person;
    if (!person) return;

    if (person.spouse_id) {
      const spouseMember = members.find(
        (m) => m.person_id === person.spouse_id && !processedIds.has(m.person_id)
      );

      if (spouseMember && spouseMember.person) {
        const husband = person.gender_id === 1 ? person : spouseMember.person;
        const wife = person.gender_id === 2 ? person : spouseMember.person;

        merged.push({
          id: `marriage-${person.id}-${spouseMember.person_id}`,
          name: `${husband.person_name} y ${wife.person_name}`,
          carisma: 'Casado',
          mobile: husband.mobile || wife.mobile || '',
          isResponsible:
            member.is_responsible_for_the_team || spouseMember.is_responsible_for_the_team,
          isMarriage: true,
        });

        if (person.id) processedIds.add(person.id);
        if (spouseMember.person_id) processedIds.add(spouseMember.person_id);
        return;
      }
    }

    merged.push({
      id: `person-${person.id}`,
      name: person.person_name,
      carisma: getCarismaLabel(person.person_type_id),
      mobile: person.mobile || '',
      isResponsible: member.is_responsible_for_the_team,
      isMarriage: false,
    });

    if (person.id) processedIds.add(person.id);
  });

  return merged.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'No especificada';
  return new Date(dateString).toLocaleDateString('es-CO');
}

function calculateYears(dateString?: string): string {
  if (!dateString) return '';
  const birthDate = new Date(dateString);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    years -= 1;
  }
  return `${years} anos`;
}

export function CommunityPrintView({
  community,
  teams,
  teamMembers,
  teamParishes,
  stepLogs,
}: CommunityPrintViewProps) {
  if (!community) return null;

  const lastStepLog = stepLogs.length > 0 ? stepLogs[0] : null;

  // Extract unique catechist names from all step logs
  const allCatechistNames = stepLogs
    .map((log) => log.principal_catechist_name)
    .filter((name): name is string => !!name && name.trim() !== '');

  // Itinerant catechists: from the most recent step log
  const itinerantCatechists = lastStepLog?.principal_catechist_name
    ? lastStepLog.principal_catechist_name
        .split(/[,;y]/)
        .map((n) => n.trim())
        .filter((n) => n !== '')
    : [];

  // All catechists who have accompanied: unique names across all step logs
  const allCatechistsSet = new Set<string>();
  allCatechistNames.forEach((nameStr) => {
    nameStr
      .split(/[,;y]/)
      .map((n) => n.trim())
      .filter((n) => n !== '')
      .forEach((n) => allCatechistsSet.add(n));
  });
  const allAccompanyingCatechists = Array.from(allCatechistsSet).sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  );

  const todayFormatted = new Date().toLocaleDateString('es-CO');

  return (
    <div className="hidden print:block print-report">
      {/* 1. Header */}
      <div className="print-report-header">
        <h1 className="print-report-title">Ficha de Comunidad {community.number}</h1>
        <p className="print-report-parish">{community.parish?.name || 'Parroquia no especificada'}</p>
      </div>

      <hr className="print-divider" />

      {/* 2. Informacion General */}
      <section className="print-report-section">
        <h2 className="print-report-section-title">Informacion General</h2>
        <div className="print-info-grid">
          <div className="print-info-item">
            <span className="print-info-label">Numero</span>
            <span className="print-info-value">{community.number}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Hermanos Actuales</span>
            <span className="print-info-value">{community.actual_brothers || 'No especificado'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Fecha de Nacimiento</span>
            <span className="print-info-value">
              {formatDate(community.born_date)}
              {community.born_date && ` (${calculateYears(community.born_date)})`}
            </span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Hermanos Iniciales</span>
            <span className="print-info-value">{community.born_brothers || 'No especificado'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Parroquia</span>
            <span className="print-info-value">{community.parish?.name || 'No especificada'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Etapa Actual</span>
            <span className="print-info-value">{community.step_way?.name || 'No especificada'}</span>
          </div>
          <div className="print-info-item">
            <span className="print-info-label">Fecha Ultima Etapa</span>
            <span className="print-info-value">{formatDate(community.last_step_way_date)}</span>
          </div>
        </div>
      </section>

      <hr className="print-divider" />

      {/* 3. Historia del Camino - Ultimo paso */}
      <section className="print-report-section">
        <h2 className="print-report-section-title">Historia del Camino</h2>
        {lastStepLog ? (
          <div className="print-info-grid">
            <div className="print-info-item">
              <span className="print-info-label">Ultimo Paso</span>
              <span className="print-info-value">{lastStepLog.step_way?.name || '-'}</span>
            </div>
            <div className="print-info-item">
              <span className="print-info-label">Fecha</span>
              <span className="print-info-value">{formatDate(lastStepLog.date_of_step)}</span>
            </div>
            {lastStepLog.notes && (
              <div className="print-info-item" style={{ gridColumn: '1 / -1' }}>
                <span className="print-info-label">Notas</span>
                <span className="print-info-value">{lastStepLog.notes}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="print-empty-text">No hay registros en la bitacora</p>
        )}
      </section>

      <hr className="print-divider" />

      {/* 4. Equipo de Responsables */}
      <section className="print-report-section">
        <h2 className="print-report-section-title">Equipo de Responsables</h2>
        {teams.responsables.length > 0 ? (
          teams.responsables.map((team) => {
            const members = mergeTeamMembers(team.id ? teamMembers[team.id] || [] : []);
            return (
              <div key={team.id}>
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Rol</th>
                      <th>Celular</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="print-empty-text">
                          No hay miembros
                        </td>
                      </tr>
                    ) : (
                      members.map((m) => (
                        <tr key={m.id}>
                          <td>{m.name}</td>
                          <td>{m.isResponsible ? 'Responsable' : 'Corresponsable'}</td>
                          <td>{m.mobile || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          })
        ) : (
          <p className="print-empty-text">No hay equipo de responsables</p>
        )}
      </section>

      <hr className="print-divider" />

      {/* 5. Equipos de Catequistas */}
      <section className="print-report-section">
        <h2 className="print-report-section-title">Equipos de Catequistas</h2>
        {teams.catequistas.length > 0 ? (
          teams.catequistas.map((team, index) => {
            const members = mergeTeamMembers(team.id ? teamMembers[team.id] || [] : []);
            const parishes = team.id ? teamParishes[team.id] || [] : [];
            return (
              <div key={team.id} className="print-team-block">
                <h3 className="print-team-subtitle">
                  Equipo de Catequistas {index + 1}
                </h3>
                {parishes.length > 0 && (
                  <p className="print-team-parishes">
                    {parishes.map((p) => `Lleva ${p.name}`).join(' | ')}
                  </p>
                )}
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Carisma</th>
                      <th>Celular</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="print-empty-text">
                          No hay miembros
                        </td>
                      </tr>
                    ) : (
                      members.map((m) => (
                        <tr key={m.id}>
                          <td>
                            {m.name}
                            {m.isResponsible && (
                              <span className="print-badge-responsible"> (Responsable)</span>
                            )}
                          </td>
                          <td>{m.carisma || '-'}</td>
                          <td>{m.mobile || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          })
        ) : (
          <p className="print-empty-text">No hay equipos de catequistas</p>
        )}
      </section>

      <hr className="print-divider" />

      {/* 6. Catequistas Itinerantes */}
      <section className="print-report-section">
        <h2 className="print-report-section-title">Catequistas Itinerantes</h2>
        {itinerantCatechists.length > 0 ? (
          <p className="print-catechist-list">{itinerantCatechists.join(', ')}</p>
        ) : (
          <p className="print-empty-text">No hay catequistas itinerantes registrados</p>
        )}
      </section>

      <hr className="print-divider" />

      {/* 7. Catequistas que han Acompanado */}
      <section className="print-report-section">
        <h2 className="print-report-section-title">Catequistas que han Acompanado</h2>
        {allAccompanyingCatechists.length > 0 ? (
          <p className="print-catechist-list">{allAccompanyingCatechists.join(', ')}</p>
        ) : (
          <p className="print-empty-text">No hay catequistas registrados en la bitacora</p>
        )}
      </section>

      {/* 8. Footer */}
      <div className="print-footer">
        Documento actualizado el {todayFormatted}
      </div>
    </div>
  );
}
