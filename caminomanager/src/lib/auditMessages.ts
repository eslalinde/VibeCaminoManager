import { AuditLog } from '@/types/database';

// ── Table labels ──

const TABLE_LABELS: Record<string, string> = {
  communities: 'Comunidad',
  teams: 'Equipos',
  brothers: 'Hermanos',
  belongs: 'Miembros de equipo',
  community_step_log: 'Bitacora',
};

// ── Column labels (DB name → Spanish) ──

const COLUMN_LABELS: Record<string, string> = {
  // communities
  number: 'Numero',
  born_date: 'Fecha de nacimiento',
  parish_id: 'Parroquia',
  born_brothers: 'Hermanos de nacimiento',
  actual_brothers: 'Hermanos actuales',
  step_way_id: 'Paso del camino',
  last_step_way_date: 'Fecha ultimo paso',
  cathechist_team_id: 'Equipo de catequistas',
  // teams
  name: 'Nombre',
  team_type_id: 'Tipo de equipo',
  community_id: 'Comunidad',
  // brothers
  person_id: 'Persona',
  // belongs
  team_id: 'Equipo',
  is_responsible_for_the_team: 'Responsable del equipo',
  // community_step_log
  date_of_step: 'Fecha del paso',
  principal_catechist_name: 'Catequista principal',
  outcome: 'Resultado',
  notes: 'Notas',
};

function getColumnLabel(col: string): string {
  return COLUMN_LABELS[col] || col;
}

export function getTableLabel(table: string): string {
  return TABLE_LABELS[table] || table;
}

// ── Operation colors ──

export type AuditColor = 'green' | 'blue' | 'red';

function getOperationColor(op: string): AuditColor {
  switch (op) {
    case 'INSERT': return 'green';
    case 'UPDATE': return 'blue';
    case 'DELETE': return 'red';
    default: return 'blue';
  }
}

// ── Person name resolution ──

export type PersonNames = Record<number, string>;
export type TeamNames = Record<number, string>;

function getPersonName(entry: AuditLog, personNames: PersonNames): string | null {
  const pid = entry.new_values?.person_id ?? entry.old_values?.person_id;
  if (typeof pid === 'number' && personNames[pid]) return personNames[pid];
  return null;
}

function getTeamNameFromValues(entry: AuditLog): string | null {
  const name = entry.new_values?.name ?? entry.old_values?.name;
  return typeof name === 'string' ? name : null;
}

function getBelongsTeamName(entry: AuditLog, teamNames: TeamNames): string | null {
  const tid = entry.new_values?.team_id ?? entry.old_values?.team_id;
  if (typeof tid === 'number' && teamNames[tid]) return teamNames[tid];
  return null;
}

// ── Message generation ──

function buildMessage(
  entry: AuditLog,
  personNames: PersonNames,
  teamNames: TeamNames
): string {
  const { table_name, operation } = entry;
  const person = getPersonName(entry, personNames);
  const team = getTeamNameFromValues(entry);
  const belongsTeam = getBelongsTeamName(entry, teamNames);

  // Helper: "al equipo «Nombre»" or "al equipo"
  const teamSuffix = belongsTeam ? ` al equipo "${belongsTeam}"` : ' al equipo';

  // Special-case: belongs UPDATE where is_responsible_for_the_team changed
  if (
    table_name === 'belongs' &&
    operation === 'UPDATE' &&
    entry.changed_columns?.includes('is_responsible_for_the_team')
  ) {
    const isNowResponsible = entry.new_values?.is_responsible_for_the_team;
    const verb = isNowResponsible ? 'Asigno como responsable' : 'Removio como responsable';
    return person ? `${verb} a ${person}${belongsTeam ? ` en "${belongsTeam}"` : ''}` : `${verb} del equipo`;
  }

  switch (table_name) {
    case 'communities':
      if (operation === 'INSERT') return 'Creo una comunidad';
      if (operation === 'UPDATE') return 'Actualizo la comunidad';
      if (operation === 'DELETE') return 'Elimino la comunidad';
      break;
    case 'teams':
      if (operation === 'INSERT') return team ? `Creo el equipo "${team}"` : 'Creo un equipo';
      if (operation === 'UPDATE') return team ? `Actualizo el equipo "${team}"` : 'Actualizo un equipo';
      if (operation === 'DELETE') return team ? `Elimino el equipo "${team}"` : 'Elimino un equipo';
      break;
    case 'brothers':
      if (operation === 'INSERT') return person ? `Agrego a ${person} a la comunidad` : 'Agrego un hermano a la comunidad';
      if (operation === 'UPDATE') return person ? `Actualizo a ${person}` : 'Actualizo un hermano';
      if (operation === 'DELETE') return person ? `Elimino a ${person} de la comunidad` : 'Elimino un hermano de la comunidad';
      break;
    case 'belongs':
      if (operation === 'INSERT') return person ? `Agrego a ${person}${teamSuffix}` : `Agrego un miembro${teamSuffix}`;
      if (operation === 'UPDATE') return person ? `Actualizo a ${person} en${belongsTeam ? ` "${belongsTeam}"` : ' el equipo'}` : 'Actualizo un miembro del equipo';
      if (operation === 'DELETE') return person ? `Elimino a ${person} de${belongsTeam ? ` "${belongsTeam}"` : 'l equipo'}` : 'Elimino un miembro del equipo';
      break;
    case 'community_step_log':
      if (operation === 'INSERT') return 'Registro una entrada en la bitacora';
      if (operation === 'UPDATE') return 'Actualizo una entrada de la bitacora';
      if (operation === 'DELETE') return 'Elimino una entrada de la bitacora';
      break;
  }

  return `${operation} en ${getTableLabel(table_name)}`;
}

// ── Change detail formatting ──

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '(vacio)';
  if (typeof val === 'boolean') return val ? 'Si' : 'No';
  return String(val);
}

export interface ChangeDetail {
  label: string;
  oldValue: string;
  newValue: string;
}

function getChangeDetails(entry: AuditLog): ChangeDetail[] {
  if (entry.operation !== 'UPDATE' || !entry.changed_columns) return [];
  return entry.changed_columns
    .filter(col => col !== 'updated_at' && col !== 'created_at')
    .map(col => ({
      label: getColumnLabel(col),
      oldValue: formatValue(entry.old_values?.[col]),
      newValue: formatValue(entry.new_values?.[col]),
    }));
}

// ── Relative time ──

export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHrs < 24) return `hace ${diffHrs}h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} dias`;

  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

// ── Public API ──

export interface FormattedAuditEntry {
  actorName: string;
  message: string;
  details: ChangeDetail[];
  color: AuditColor;
  relativeTime: string;
}

export function formatAuditEntry(
  entry: AuditLog,
  personNames: PersonNames = {},
  teamNames: TeamNames = {}
): FormattedAuditEntry {
  const actorName = entry.user_profile?.full_name || 'Usuario desconocido';
  const message = buildMessage(entry, personNames, teamNames);
  const details = getChangeDetails(entry);
  const color = getOperationColor(entry.operation);
  const time = relativeTime(entry.created_at || new Date().toISOString());

  return { actorName, message, details, color, relativeTime: time };
}
